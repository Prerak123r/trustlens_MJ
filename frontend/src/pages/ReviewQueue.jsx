import { useEffect, useState } from "react";

import { getAllClaims } from "../services/api";
import {
    getClaimVerificationRuns,
    getVerificationRun,
} from "../services/verificationService";

function ReviewQueue() {
    const [reviewClaims, setReviewClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReviewQueue();
    }, []);

    async function loadReviewQueue() {
        try {
            setLoading(true);
            setError("");

            const claimsResponse = await getAllClaims();

            const claims = claimsResponse.claims || [];

            const reviewResults = [];

            for (const claim of claims) {
                try {
                    const runsResponse =
                        await getClaimVerificationRuns(claim.id);

                    const runs =
                        runsResponse.verification_runs || [];

                    if (runs.length === 0) {
                        continue;
                    }

                    const latestRun = runs[0];

                    const runDetails =
                        await getVerificationRun(latestRun.id);

                    const trustAssessment =
                        runDetails.analysis_results?.find(
                            (analysis) =>
                                analysis.analysis_type ===
                                "TRUST_ASSESSMENT"
                        );

                    if (!trustAssessment) {
                        continue;
                    }

                    const result =
                        trustAssessment.result || {};

                    const decision =
                        result.decision ||
                        result.trust_level ||
                        result.classification ||
                        result.status;

                    if (
                        decision === "REVIEW_NEEDED" ||
                        decision === "Review Needed"
                    ) {
                        reviewResults.push({
                            claim,
                            run: runDetails,
                            trustAssessment,
                        });
                    }
                } catch (claimError) {
                    console.warn(
                        `Unable to inspect claim ${claim.id}:`,
                        claimError
                    );
                }
            }

            setReviewClaims(reviewResults);
        } catch (err) {
            setError(
                err.message ||
                    "Failed to load the review queue."
            );
        } finally {
            setLoading(false);
        }
    }

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        return new Date(value).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }

    function getPriority(item) {
        const result =
            item.trustAssessment?.result || {};

        const uncertainty =
            result.uncertainty ||
            result.uncertainty_level ||
            result.confidence;

        if (
            typeof uncertainty === "number" &&
            uncertainty >= 0.7
        ) {
            return "HIGH";
        }

        return "MEDIUM";
    }

    function getReason(item) {
        const result =
            item.trustAssessment?.result || {};

        return (
            result.reason ||
            result.explanation ||
            result.message ||
            "Trust assessment requires manual review."
        );
    }

    if (loading) {
        return (
            <div className="review-queue-page">
                <div className="loading-card">
                    Analyzing verification results...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="review-queue-page">
                <div className="admin-error">
                    <strong>
                        Unable to load Review Queue
                    </strong>

                    <span>{error}</span>

                    <button
                        className="primary-button"
                        onClick={loadReviewQueue}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="review-queue-page">
            <section className="review-queue-header">
                <div>
                    <div className="admin-section-label">
                        HUMAN REVIEW
                    </div>

                    <h2>Review Queue</h2>

                    <p>
                        Claims identified by TrustLens as requiring
                        administrative attention.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={loadReviewQueue}
                >
                    Refresh Queue
                </button>
            </section>

            <section className="review-summary">
                <div className="review-summary-card">
                    <div className="review-summary-icon">
                        !
                    </div>

                    <div>
                        <span>Cases Requiring Review</span>
                        <strong>{reviewClaims.length}</strong>
                    </div>
                </div>

                <div className="review-summary-card">
                    <div className="review-summary-icon high">
                        ↑
                    </div>

                    <div>
                        <span>High Priority</span>

                        <strong>
                            {
                                reviewClaims.filter(
                                    (item) =>
                                        getPriority(item) === "HIGH"
                                ).length
                            }
                        </strong>
                    </div>
                </div>
            </section>

            {reviewClaims.length === 0 ? (
                <div className="review-empty-card">
                    <div className="review-empty-icon">
                        ✓
                    </div>

                    <h3>Review Queue is Clear</h3>

                    <p>
                        No completed verification runs currently
                        require manual review.
                    </p>
                </div>
            ) : (
                <section className="review-list-card">
                    <div className="review-list-header">
                        <div>
                            <div className="admin-section-label">
                                CASES
                            </div>

                            <h3>Claims Requiring Attention</h3>
                        </div>

                        <span className="overview-count warning-count">
                            {reviewClaims.length}
                        </span>
                    </div>

                    <div className="review-table-wrapper">
                        <table className="review-table">
                            <thead>
                                <tr>
                                    <th>Claim</th>
                                    <th>Verification Run</th>
                                    <th>Evidence</th>
                                    <th>Priority</th>
                                    <th>Reason</th>
                                    <th>Started</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reviewClaims.map((item) => {
                                    const priority =
                                        getPriority(item);

                                    return (
                                        <tr
                                            key={
                                                item.claim.id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        item.claim
                                                            .claim_number
                                                    }
                                                </strong>

                                                <span>
                                                    Claim #
                                                    {
                                                        item.claim
                                                            .id
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    Run #
                                                    {
                                                        item.run
                                                            .id
                                                    }
                                                </strong>

                                                <span>
                                                    Pipeline{" "}
                                                    {
                                                        item.run
                                                            .pipeline_version
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <span className="review-evidence-count">
                                                    {
                                                        item.claim
                                                            .evidence_count
                                                    }{" "}
                                                    files
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        priority ===
                                                        "HIGH"
                                                            ? "priority-pill priority-high"
                                                            : "priority-pill priority-medium"
                                                    }
                                                >
                                                    {priority}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="review-reason">
                                                    {getReason(
                                                        item
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="review-date">
                                                    {formatDate(
                                                        item.run
                                                            .started_at
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

export default ReviewQueue;