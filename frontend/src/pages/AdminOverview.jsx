import { useEffect, useMemo, useState } from "react";

import { getAllClaims } from "../services/api";

function AdminOverview() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            const data = await getAllClaims();

            setClaims(data.claims || []);
        } catch (err) {
            setError(
                err.message || "Failed to load admin dashboard."
            );
        } finally {
            setLoading(false);
        }
    }

    const metrics = useMemo(() => {
        const total = claims.length;

        const pending = claims.filter(
            (claim) => claim.status === "PENDING"
        ).length;

        const verificationStarted = claims.filter(
            (claim) => claim.status === "VERIFICATION_STARTED"
        ).length;

        const completed = claims.filter(
            (claim) =>
                claim.status === "COMPLETED" ||
                claim.verification_runs?.some(
                    (run) => run.status === "COMPLETED"
                )
        ).length;

        const reviewNeeded = claims.filter((claim) => {
            const latestRun = claim.verification_runs?.[0];

            const trustAnalysis = latestRun?.analysis_results?.find(
                (analysis) =>
                    analysis.analysis_type === "TRUST_ASSESSMENT"
            );

            return (
                trustAnalysis?.result?.decision === "REVIEW_NEEDED" ||
                trustAnalysis?.result?.trust_level === "REVIEW_NEEDED"
            );
        }).length;

        const totalRuns = claims.reduce(
            (total, claim) =>
                total + (claim.verification_runs?.length || 0),
            0
        );

        return {
            total,
            pending,
            verificationStarted,
            completed,
            reviewNeeded,
            totalRuns,
        };
    }, [claims]);

    const recentClaims = claims.slice(0, 5);

    const reviewClaims = claims.filter((claim) => {
        const latestRun = claim.verification_runs?.[0];

        const trustAnalysis = latestRun?.analysis_results?.find(
            (analysis) =>
                analysis.analysis_type === "TRUST_ASSESSMENT"
        );

        return (
            trustAnalysis?.result?.decision === "REVIEW_NEEDED" ||
            trustAnalysis?.result?.trust_level === "REVIEW_NEEDED"
        );
    }).slice(0, 5);

    function getStatusClass(status) {
        switch (status) {
            case "COMPLETED":
                return "status-success";

            case "VERIFICATION_STARTED":
                return "status-warning";

            case "PENDING":
                return "status-neutral";

            default:
                return "status-neutral";
        }
    }

    function formatStatus(status) {
        if (!status) {
            return "Unknown";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        return new Date(value).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    if (loading) {
        return (
            <div className="admin-overview">
                <div className="loading-card">
                    Loading admin dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-overview">
                <div className="admin-error">
                    <strong>Unable to load dashboard</strong>
                    <span>{error}</span>

                    <button
                        className="primary-button"
                        onClick={loadDashboard}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-overview">
            <section className="overview-welcome">
                <div>
                    <div className="admin-section-label">
                        OPERATIONS OVERVIEW
                    </div>

                    <h2>Claims Verification Dashboard</h2>

                    <p>
                        Monitor insurance claims, verification activity,
                        and cases requiring administrative review.
                    </p>
                </div>

                <button
                    className="secondary-button"
                    onClick={loadDashboard}
                >
                    Refresh Data
                </button>
            </section>

            <section className="overview-metrics">
                <div className="overview-metric-card">
                    <div className="metric-icon">▤</div>

                    <div>
                        <span>Total Claims</span>
                        <strong>{metrics.total}</strong>
                    </div>
                </div>

                <div className="overview-metric-card">
                    <div className="metric-icon">◷</div>

                    <div>
                        <span>Pending</span>
                        <strong>{metrics.pending}</strong>
                    </div>
                </div>

                <div className="overview-metric-card">
                    <div className="metric-icon">◉</div>

                    <div>
                        <span>Verification Active</span>
                        <strong>
                            {metrics.verificationStarted}
                        </strong>
                    </div>
                </div>

                <div className="overview-metric-card">
                    <div className="metric-icon">✓</div>

                    <div>
                        <span>Completed</span>
                        <strong>{metrics.completed}</strong>
                    </div>
                </div>

                <div className="overview-metric-card review-metric">
                    <div className="metric-icon">!</div>

                    <div>
                        <span>Review Needed</span>
                        <strong>{metrics.reviewNeeded}</strong>
                    </div>
                </div>

                <div className="overview-metric-card">
                    <div className="metric-icon">◇</div>

                    <div>
                        <span>Verification Runs</span>
                        <strong>{metrics.totalRuns}</strong>
                    </div>
                </div>
            </section>

            <section className="overview-grid">
                <div className="overview-panel">
                    <div className="overview-panel-header">
                        <div>
                            <div className="admin-section-label">
                                ACTIVITY
                            </div>

                            <h3>Recent Claims</h3>
                        </div>

                        <span className="overview-count">
                            {recentClaims.length}
                        </span>
                    </div>

                    {recentClaims.length === 0 ? (
                        <div className="overview-empty">
                            No claims available.
                        </div>
                    ) : (
                        <div className="overview-claim-list">
                            {recentClaims.map((claim) => (
                                <div
                                    className="overview-claim-row"
                                    key={claim.id}
                                >
                                    <div>
                                        <strong>
                                            {claim.claim_number}
                                        </strong>

                                        <span>
                                            Claim #{claim.id} •{" "}
                                            {formatDate(
                                                claim.created_at
                                            )}
                                        </span>
                                    </div>

                                    <div className="overview-claim-meta">
                                        <span>
                                            {claim.evidence_count || 0}{" "}
                                            evidence
                                        </span>

                                        <span
                                            className={`status-pill ${getStatusClass(
                                                claim.status
                                            )}`}
                                        >
                                            {formatStatus(
                                                claim.status
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="overview-panel">
                    <div className="overview-panel-header">
                        <div>
                            <div className="admin-section-label">
                                ATTENTION
                            </div>

                            <h3>Review Queue</h3>
                        </div>

                        <span className="overview-count warning-count">
                            {metrics.reviewNeeded}
                        </span>
                    </div>

                    {reviewClaims.length === 0 ? (
                        <div className="overview-empty success-empty">
                            <div className="overview-empty-icon">
                                ✓
                            </div>

                            <strong>
                                No claims currently require review
                            </strong>

                            <span>
                                The verification queue is clear.
                            </span>
                        </div>
                    ) : (
                        <div className="overview-claim-list">
                            {reviewClaims.map((claim) => (
                                <div
                                    className="overview-claim-row"
                                    key={claim.id}
                                >
                                    <div>
                                        <strong>
                                            {claim.claim_number}
                                        </strong>

                                        <span>
                                            Claim #{claim.id}
                                        </span>
                                    </div>

                                    <span className="status-pill status-warning">
                                        Review Needed
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="overview-system-card">
                <div className="system-status-large">
                    <span className="system-status-dot"></span>

                    <div>
                        <strong>
                            TrustLens Verification Engine
                        </strong>

                        <span>
                            System operational and ready to process
                            verification runs.
                        </span>
                    </div>
                </div>

                <div className="system-stat">
                    <span>Pipeline</span>
                    <strong>v0.1.0</strong>
                </div>

                <div className="system-stat">
                    <span>Claims Loaded</span>
                    <strong>{metrics.total}</strong>
                </div>

                <div className="system-stat">
                    <span>Runs Recorded</span>
                    <strong>{metrics.totalRuns}</strong>
                </div>
            </section>
        </div>
    );
}

export default AdminOverview;