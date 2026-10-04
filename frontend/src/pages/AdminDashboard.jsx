import { useEffect, useState } from "react";

import { getAllClaims, getClaim } from "../services/api";
import {
    getClaimVerificationRuns,
    getVerificationRun,
} from "../services/verificationService";


function AdminDashboard({
    claimId,
    setClaimId,
    requestedRunId,
}) {
    const [claims, setClaims] = useState([]);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [verificationRuns, setVerificationRuns] = useState([]);
    const [selectedRun, setSelectedRun] = useState(null);

    const [loadingClaims, setLoadingClaims] = useState(true);
    const [loadingClaim, setLoadingClaim] = useState(false);
    const [loadingRuns, setLoadingRuns] = useState(false);
    const [loadingRun, setLoadingRun] = useState(false);

    const [error, setError] = useState("");
    const [runError, setRunError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");


    // ==================================================
    // LOAD ALL CLAIMS
    // ==================================================

    async function loadClaims() {
        setLoadingClaims(true);
        setError("");

        try {
            const data = await getAllClaims();

            setClaims(data.claims || []);
        } catch (err) {
            setError(
                err.message || "Failed to load claims."
            );
        } finally {
            setLoadingClaims(false);
        }
    }


    // ==================================================
    // LOAD SELECTED CLAIM
    // ==================================================

    async function openClaim(id, runIdToOpen = null) {
        setLoadingClaim(true);
        setError("");
        setRunError("");

        setSelectedClaim(null);
        setVerificationRuns([]);
        setSelectedRun(null);

        try {
            const data = await getClaim(id);

            setSelectedClaim(data);
            setClaimId(String(id));

            await loadVerificationRuns(
                id,
                runIdToOpen
            );
        } catch (err) {
            setError(
                err.message || "Failed to load claim."
            );
        } finally {
            setLoadingClaim(false);
        }
    }


    // ==================================================
    // LOAD VERIFICATION RUNS
    // ==================================================

    async function loadVerificationRuns(
        id,
        runIdToOpen = null
    ) {
        setLoadingRuns(true);
        setRunError("");

        try {
            const data =
                await getClaimVerificationRuns(id);

            const runs =
                data.verification_runs || [];

            setVerificationRuns(runs);

            /*
             * If a specific run was requested from the
             * Verification Runs page, open that exact run.
             *
             * Otherwise open the latest run.
             */
            if (runs.length > 0) {
                const requestedRun =
                    runIdToOpen !== null
                        ? runs.find(
                              (run) =>
                                  Number(run.id) ===
                                  Number(runIdToOpen)
                          )
                        : null;

                if (requestedRun) {
                    await loadVerificationRun(
                        requestedRun.id,
                        id
                    );
                } else {
                    await loadVerificationRun(
                        runs[0].id,
                        id
                    );
                }
            }
        } catch (err) {
            setRunError(
                err.message ||
                    "Failed to load verification runs."
            );
        } finally {
            setLoadingRuns(false);
        }
    }


    // ==================================================
    // LOAD SINGLE VERIFICATION RUN
    // ==================================================

    async function loadVerificationRun(
        runId,
        expectedClaimId = selectedClaim?.id
    ) {
        setLoadingRun(true);
        setRunError("");

        try {
            const data =
                await getVerificationRun(runId);

            /*
             * Important:
             *
             * runId = Verification Run ID
             * expectedClaimId = Claim ID
             *
             * They must never be confused.
             */
            if (
                expectedClaimId &&
                Number(data.claim_id) !==
                    Number(expectedClaimId)
            ) {
                throw new Error(
                    "This verification run does not belong to the selected claim."
                );
            }

            setSelectedRun(data);
        } catch (err) {
            setSelectedRun(null);

            setRunError(
                err.message ||
                    "Failed to load verification run."
            );
        } finally {
            setLoadingRun(false);
        }
    }


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        loadClaims();
    }, []);


    // ==================================================
    // OPEN CLAIM / RUN REQUESTED FROM APP
    // ==================================================
    /*
     * App.jsx receives the custom event from
     * VerificationRuns.jsx.
     *
     * App.jsx then changes:
     *
     * adminSection = "claims"
     * adminClaimId = selected claim
     * adminRunId = requested verification run
     *
     * This effect reacts to those values.
     */

    useEffect(() => {
        if (!requestedRunId) {
            return;
        }

        if (!claimId) {
            return;
        }

        openClaim(
            Number(claimId),
            Number(requestedRunId)
        );
    }, [requestedRunId]);


    // ==================================================
    // FILTER CLAIMS
    // ==================================================

    const filteredClaims = claims.filter((claim) => {
        const query =
            search.trim().toLowerCase();

        const matchesSearch =
            !query ||
            String(claim.id)
                .toLowerCase()
                .includes(query) ||
            String(claim.claim_number || "")
                .toLowerCase()
                .includes(query);

        const matchesStatus =
            statusFilter === "ALL" ||
            String(claim.status || "")
                .toUpperCase() === statusFilter;

        return (
            matchesSearch &&
            matchesStatus
        );
    });


    // ==================================================
    // HELPERS
    // ==================================================

    function getStatusClass(status) {
        if (!status) {
            return "status-neutral";
        }

        const normalized =
            String(status).toUpperCase();

        if (
            normalized.includes("COMPLETED") ||
            normalized.includes("AUTHENTIC") ||
            normalized.includes("LOW")
        ) {
            return "status-success";
        }

        if (
            normalized.includes("REVIEW") ||
            normalized.includes("WARNING") ||
            normalized.includes("PENDING") ||
            normalized.includes("STARTED")
        ) {
            return "status-warning";
        }

        if (
            normalized.includes("FAILED") ||
            normalized.includes("ERROR") ||
            normalized.includes("TAMPERED")
        ) {
            return "status-danger";
        }

        return "status-neutral";
    }


    function formatDate(value) {
        if (!value) {
            return "—";
        }

        try {
            return new Date(value).toLocaleString();
        } catch {
            return value;
        }
    }


    function getRunCount(claim) {
        return (
            claim.verification_runs?.length || 0
        );
    }


    function getLatestRun(claim) {
        return (
            claim.verification_runs?.[0] ||
            null
        );
    }


    function findAnalysis(type) {
        if (!selectedRun?.analysis_results) {
            return [];
        }

        return selectedRun.analysis_results.filter(
            (item) =>
                item.analysis_type === type
        );
    }


    // ==================================================
    // DASHBOARD
    // ==================================================

    return (
        <div className="admin-dashboard page-container">

            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}

            <section className="admin-hero clay-card">

                <div>
                    <div className="eyebrow">
                        INSURANCE OPERATIONS
                    </div>

                    <h1>
                        Claims Operations
                    </h1>

                    <p>
                        Review insurance claims,
                        verification runs, evidence,
                        and authenticity signals.
                    </p>
                </div>

                <div className="admin-hero-badge">
                    <span className="admin-dot" />
                    Admin Console
                </div>

            </section>


            {/* ======================================== */}
            {/* DASHBOARD METRICS */}
            {/* ======================================== */}

            <section className="admin-stats-grid">

                <AdminMetric
                    label="Total Claims"
                    value={claims.length}
                />

                <AdminMetric
                    label="Verification Runs"
                    value={claims.reduce(
                        (total, claim) =>
                            total +
                            getRunCount(claim),
                        0
                    )}
                />

                <AdminMetric
                    label="Pending Claims"
                    value={claims.filter(
                        (claim) =>
                            String(
                                claim.status || ""
                            )
                                .toUpperCase()
                                .includes("PENDING")
                    ).length}
                />

                <AdminMetric
                    label="Claims Under Review"
                    value={claims.filter(
                        (claim) =>
                            String(
                                claim.status || ""
                            )
                                .toUpperCase()
                                .includes("REVIEW")
                    ).length}
                />

            </section>


            {/* ======================================== */}
            {/* ALL CLAIMS */}
            {/* ======================================== */}

            <section className="clay-card claims-list-card">

                <div className="section-heading">

                    <div>
                        <div className="eyebrow">
                            CLAIM MANAGEMENT
                        </div>

                        <h2>
                            All Claims
                        </h2>

                        <p>
                            Select a claim to inspect its
                            verification history.
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={loadClaims}
                        disabled={loadingClaims}
                    >
                        {loadingClaims
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>


                {/* SEARCH + FILTER */}

                <div className="claims-toolbar">

                    <input
                        className="admin-input"
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search Claim ID or Claim Number"
                    />

                    <select
                        className="admin-input"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="VERIFICATION_STARTED">
                            Verification Started
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="REVIEW_NEEDED">
                            Review Needed
                        </option>
                    </select>

                </div>


                {error && (
                    <div className="admin-error">
                        {error}
                    </div>
                )}


                {loadingClaims ? (
                    <div className="empty-state">
                        Loading claims...
                    </div>
                ) : filteredClaims.length === 0 ? (
                    <div className="empty-state">

                        <strong>
                            No claims found.
                        </strong>

                        <span>
                            Try changing your search
                            or status filter.
                        </span>

                    </div>
                ) : (
                    <div className="claims-table-wrapper">

                        <table className="claims-table">

                            <thead>
                                <tr>
                                    <th>
                                        Claim
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Evidence
                                    </th>

                                    <th>
                                        Verification Runs
                                    </th>

                                    <th>
                                        Latest Run
                                    </th>

                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredClaims.map(
                                    (claim) => {

                                        const latestRun =
                                            getLatestRun(
                                                claim
                                            );

                                        const isSelected =
                                            selectedClaim?.id ===
                                            claim.id;

                                        return (
                                            <tr
                                                key={claim.id}
                                                className={
                                                    isSelected
                                                        ? "selected-row"
                                                        : ""
                                                }
                                            >

                                                <td>
                                                    <div className="claim-table-main">

                                                        <strong>
                                                            Claim #
                                                            {claim.id}
                                                        </strong>

                                                        <span>
                                                            {claim.claim_number ||
                                                                "No claim number"}
                                                        </span>

                                                    </div>
                                                </td>


                                                <td>

                                                    <span
                                                        className={`status-pill ${getStatusClass(
                                                            claim.status
                                                        )}`}
                                                    >
                                                        {claim.status ||
                                                            "UNKNOWN"}
                                                    </span>

                                                </td>


                                                <td>
                                                    {claim.evidence_count ??
                                                        0}
                                                </td>


                                                <td>
                                                    {getRunCount(
                                                        claim
                                                    )}
                                                </td>


                                                <td>

                                                    {latestRun ? (
                                                        <div className="latest-run-cell">

                                                            <strong>
                                                                Run #
                                                                {latestRun.id}
                                                            </strong>

                                                            <span
                                                                className={`status-pill ${getStatusClass(
                                                                    latestRun.status
                                                                )}`}
                                                            >
                                                                {latestRun.status ||
                                                                    "UNKNOWN"}
                                                            </span>

                                                        </div>
                                                    ) : (
                                                        "No run"
                                                    )}

                                                </td>


                                                <td>

                                                    <button
                                                        className={
                                                            isSelected
                                                                ? "primary-button small-button"
                                                                : "secondary-button small-button"
                                                        }
                                                        onClick={() =>
                                                            openClaim(
                                                                claim.id
                                                            )
                                                        }
                                                    >
                                                        {isSelected
                                                            ? "Opened"
                                                            : "Review Claim"}
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>


            {/* ======================================== */}
            {/* SELECTED CLAIM */}
            {/* ======================================== */}

            {loadingClaim && (
                <section className="clay-card loading-card">
                    Loading claim...
                </section>
            )}


            {selectedClaim &&
                !loadingClaim && (
                    <>

                        <section className="clay-card claim-overview-card">

                            <div className="claim-overview-main">

                                <div className="eyebrow">
                                    SELECTED CLAIM
                                </div>

                                <h2>
                                    Claim #{selectedClaim.id}
                                </h2>

                                <p>
                                    Claim Number:{" "}
                                    <strong>
                                        {selectedClaim.claim_number ||
                                            "—"}
                                    </strong>
                                </p>

                            </div>

                            <div className="claim-status-block">

                                <span className="small-label">
                                    CLAIM STATUS
                                </span>

                                <span
                                    className={`status-pill ${getStatusClass(
                                        selectedClaim.status
                                    )}`}
                                >
                                    {selectedClaim.status ||
                                        "UNKNOWN"}
                                </span>

                            </div>

                        </section>


                        {/* ================================= */}
                        {/* VERIFICATION HISTORY */}
                        {/* ================================= */}

                        <section className="clay-card verification-history-card">

                            <div className="section-heading">

                                <div>
                                    <div className="eyebrow">
                                        VERIFICATION HISTORY
                                    </div>

                                    <h2>
                                        Verification Runs
                                    </h2>

                                    <p>
                                        Verification runs associated
                                        with Claim #
                                        {selectedClaim.id}.
                                    </p>
                                </div>

                                <div className="run-count-badge">
                                    {verificationRuns.length}{" "}
                                    {verificationRuns.length === 1
                                        ? "Run"
                                        : "Runs"}
                                </div>

                            </div>


                            {loadingRuns ? (
                                <div className="empty-state">
                                    Loading verification history...
                                </div>
                            ) : verificationRuns.length === 0 ? (
                                <div className="empty-state">

                                    <strong>
                                        No verification runs found.
                                    </strong>

                                    <span>
                                        This claim has not been
                                        verified yet.
                                    </span>

                                </div>
                            ) : (
                                <div className="verification-run-list">

                                    {verificationRuns.map(
                                        (run) => {

                                            const isSelected =
                                                selectedRun?.id ===
                                                run.id;

                                            return (
                                                <button
                                                    key={run.id}
                                                    className={
                                                        isSelected
                                                            ? "verification-run-item selected"
                                                            : "verification-run-item"
                                                    }
                                                    onClick={() =>
                                                        loadVerificationRun(
                                                            run.id,
                                                            selectedClaim.id
                                                        )
                                                    }
                                                >

                                                    <div className="run-main">

                                                        <div className="run-title">
                                                            Verification Run #
                                                            {run.id}
                                                        </div>

                                                        <div className="run-subtitle">
                                                            Belongs to Claim #
                                                            {selectedClaim.id}
                                                        </div>

                                                    </div>


                                                    <div className="run-meta">

                                                        <span
                                                            className={`status-pill ${getStatusClass(
                                                                run.status
                                                            )}`}
                                                        >
                                                            {run.status ||
                                                                "UNKNOWN"}
                                                        </span>

                                                        <span className="run-analysis-count">
                                                            {run.analysis_count ??
                                                                0}{" "}
                                                            analyses
                                                        </span>

                                                        <span className="run-date">
                                                            {formatDate(
                                                                run.completed_at ||
                                                                run.started_at
                                                            )}
                                                        </span>

                                                    </div>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>
                            )}


                            {runError && (
                                <div className="admin-error">
                                    {runError}
                                </div>
                            )}

                        </section>


                        {/* ================================= */}
                        {/* SELECTED RUN DETAILS */}
                        {/* ================================= */}

                        {loadingRun && (
                            <section className="clay-card loading-card">
                                Loading verification run...
                            </section>
                        )}

                        {selectedRun &&
                            !loadingRun && (
                                <AdminVerificationDetails
                                    run={selectedRun}
                                    findAnalysis={findAnalysis}
                                    getStatusClass={
                                        getStatusClass
                                    }
                                    formatDate={formatDate}
                                />
                            )}

                    </>
                )}

        </div>
    );
}


/* ================================================== */
/* VERIFICATION DETAILS                               */
/* ================================================== */

function AdminVerificationDetails({
    run,
    findAnalysis,
    getStatusClass,
    formatDate,
}) {
    const tamperingResults =
        findAnalysis(
            "TAMPERING_DETECTION"
        );

    const aiGenerationResults =
        findAnalysis(
            "AI_GENERATION"
        );

    const trustResults =
        findAnalysis(
            "TRUST_ASSESSMENT"
        );

    const uncertaintyResults =
        findAnalysis(
            "UNCERTAINTY"
        );

    const fusionResults =
        findAnalysis(
            "FUSION"
        );

    const crossEvidenceResults =
        findAnalysis(
            "CROSS_EVIDENCE"
        );


    return (
        <div className="admin-verification-details">

            <section className="clay-card run-header-card">

                <div>

                    <div className="eyebrow">
                        SELECTED VERIFICATION
                    </div>

                    <h2>
                        Verification Run #{run.id}
                    </h2>

                    <p>
                        Verification Run #{run.id}
                        belongs to Claim #
                        {run.claim_id}.
                    </p>

                </div>

                <div className="run-header-status">

                    <span className="small-label">
                        RUN STATUS
                    </span>

                    <span
                        className={`status-pill ${getStatusClass(
                            run.status
                        )}`}
                    >
                        {run.status || "UNKNOWN"}
                    </span>

                </div>

            </section>


            <section className="admin-stats-grid">

                <AdminMetric
                    label="Verification Run ID"
                    value={`#${run.id}`}
                />

                <AdminMetric
                    label="Claim ID"
                    value={`#${run.claim_id}`}
                />

                <AdminMetric
                    label="Pipeline Version"
                    value={
                        run.pipeline_version || "—"
                    }
                />

                <AdminMetric
                    label="Analysis Results"
                    value={
                        run.analysis_results?.length ||
                        0
                    }
                />

            </section>


            <section className="clay-card run-timeline-card">

                <div className="section-heading">

                    <div>
                        <div className="eyebrow">
                            EXECUTION
                        </div>

                        <h2>
                            Verification Timeline
                        </h2>
                    </div>

                </div>

                <div className="timeline-grid">

                    <TimelineItem
                        label="Started"
                        value={formatDate(
                            run.started_at
                        )}
                    />

                    <TimelineItem
                        label="Completed"
                        value={formatDate(
                            run.completed_at
                        )}
                    />

                    <TimelineItem
                        label="Pipeline"
                        value={
                            run.pipeline_version ||
                            "—"
                        }
                    />

                </div>

            </section>


            <section className="clay-card analysis-section">

                <div className="section-heading">

                    <div>
                        <div className="eyebrow">
                            FORENSIC ANALYSIS
                        </div>

                        <h2>
                            Model Signals
                        </h2>

                        <p>
                            Detailed forensic outputs
                            available to insurance
                            administrators.
                        </p>
                    </div>

                </div>

                <div className="analysis-grid">

                    <TamperingPanel
                        results={tamperingResults}
                    />

                    <AIGenerationPanel
                        results={
                            aiGenerationResults
                        }
                    />

                </div>

            </section>


            <section className="clay-card analysis-section">

                <div className="section-heading">

                    <div>
                        <div className="eyebrow">
                            CLAIM-LEVEL ANALYSIS
                        </div>

                        <h2>
                            Evidence Fusion & Trust
                        </h2>
                    </div>

                </div>

                <div className="analysis-grid">

                    <GenericAnalysisPanel
                        title="Trust Assessment"
                        type="TRUST_ASSESSMENT"
                        results={trustResults}
                    />

                    <GenericAnalysisPanel
                        title="Uncertainty"
                        type="UNCERTAINTY"
                        results={
                            uncertaintyResults
                        }
                    />

                    <GenericAnalysisPanel
                        title="Evidence Fusion"
                        type="FUSION"
                        results={fusionResults}
                    />

                    <GenericAnalysisPanel
                        title="Cross-Evidence"
                        type="CROSS_EVIDENCE"
                        results={
                            crossEvidenceResults
                        }
                    />

                </div>

            </section>


            <section className="clay-card analysis-log-card">

                <div className="section-heading">

                    <div>
                        <div className="eyebrow">
                            ANALYSIS LOG
                        </div>

                        <h2>
                            Complete Verification Results
                        </h2>
                    </div>

                </div>

                <div className="analysis-table-wrapper">

                    <table className="analysis-table">

                        <thead>
                            <tr>
                                <th>
                                    Analysis
                                </th>

                                <th>
                                    Evidence
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Message
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {(run.analysis_results || [])
                                .map(
                                    (analysis) => (
                                        <tr
                                            key={
                                                analysis.id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        analysis.analysis_type
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {analysis.evidence_id
                                                    ? `#${analysis.evidence_id}`
                                                    : "Claim-level"}
                                            </td>

                                            <td>

                                                <span
                                                    className={`status-pill ${getStatusClass(
                                                        analysis.status
                                                    )}`}
                                                >
                                                    {
                                                        analysis.status
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {
                                                    analysis.message ||
                                                    "—"
                                                }
                                            </td>

                                        </tr>
                                    )
                                )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
}


/* ================================================== */
/* TAMPERING PANEL                                    */
/* ================================================== */

function TamperingPanel({ results }) {
    return (
        <div className="analysis-panel">

            <div className="analysis-panel-header">

                <span className="analysis-icon">
                    T
                </span>

                <div>
                    <h3>
                        Tampering Detection
                    </h3>

                    <span>
                        Image manipulation signal
                    </span>
                </div>

            </div>


            {results.length === 0 ? (
                <EmptyAnalysis />
            ) : (
                <div className="analysis-result-list">

                    {results.map((item) => {

                        const result =
                            item.result || {};

                        return (
                            <div
                                className="analysis-result-row"
                                key={item.id}
                            >

                                <div>
                                    <span className="small-label">
                                        EVIDENCE
                                    </span>

                                    <strong>
                                        #
                                        {item.evidence_id ||
                                            "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span className="small-label">
                                        PREDICTION
                                    </span>

                                    <strong>
                                        {result.prediction ||
                                            "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span className="small-label">
                                        CONFIDENCE
                                    </span>

                                    <strong>
                                        {formatProbability(
                                            result.confidence
                                        )}
                                    </strong>
                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}


/* ================================================== */
/* AI GENERATION PANEL                                */
/* ================================================== */

function AIGenerationPanel({
    results,
}) {
    return (
        <div className="analysis-panel">

            <div className="analysis-panel-header">

                <span className="analysis-icon">
                    AI
                </span>

                <div>
                    <h3>
                        AI Generation Detection
                    </h3>

                    <span>
                        Synthetic-image signal
                    </span>
                </div>

            </div>


            {results.length === 0 ? (
                <EmptyAnalysis />
            ) : (
                <div className="analysis-result-list">

                    {results.map((item) => {

                        const result =
                            item.result || {};

                        return (
                            <div
                                className="analysis-result-row"
                                key={item.id}
                            >

                                <div>
                                    <span className="small-label">
                                        EVIDENCE
                                    </span>

                                    <strong>
                                        #
                                        {item.evidence_id ||
                                            "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span className="small-label">
                                        PREDICTION
                                    </span>

                                    <strong>
                                        {result.prediction ||
                                            "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span className="small-label">
                                        CONFIDENCE
                                    </span>

                                    <strong>
                                        {formatProbability(
                                            result.confidence
                                        )}
                                    </strong>
                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
}


/* ================================================== */
/* GENERIC ANALYSIS PANEL                             */
/* ================================================== */

function GenericAnalysisPanel({
    title,
    type,
    results,
}) {
    return (
        <div className="analysis-panel">

            <div className="analysis-panel-header">

                <span className="analysis-icon">
                    {type.substring(0, 2)}
                </span>

                <div>
                    <h3>
                        {title}
                    </h3>

                    <span>
                        {type}
                    </span>
                </div>

            </div>


            {results.length === 0 ? (
                <EmptyAnalysis />
            ) : (
                <div className="generic-result-list">

                    {results.map((item) => (

                        <div
                            className="generic-result-item"
                            key={item.id}
                        >

                            <div className="generic-result-status">

                                <span className="small-label">
                                    STATUS
                                </span>

                                <strong>
                                    {item.status ||
                                        "—"}
                                </strong>

                            </div>

                            <pre>
                                {JSON.stringify(
                                    item.result || {},
                                    null,
                                    2
                                )}
                            </pre>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}


/* ================================================== */
/* METRIC                                             */
/* ================================================== */

function AdminMetric({
    label,
    value,
}) {
    return (
        <div className="clay-card admin-metric">

            <span className="small-label">
                {label}
            </span>

            <strong className="metric-value">
                {value}
            </strong>

        </div>
    );
}


/* ================================================== */
/* TIMELINE                                           */
/* ================================================== */

function TimelineItem({
    label,
    value,
}) {
    return (
        <div className="timeline-item">

            <span className="small-label">
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


/* ================================================== */
/* EMPTY STATE                                        */
/* ================================================== */

function EmptyAnalysis() {
    return (
        <div className="empty-analysis">
            No result available for this analysis stage.
        </div>
    );
}


/* ================================================== */
/* PROBABILITY FORMATTER                              */
/* ================================================== */

function formatProbability(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    if (number <= 1) {
        return `${(
            number * 100
        ).toFixed(1)}%`;
    }

    return `${number.toFixed(1)}%`;
}


export default AdminDashboard;