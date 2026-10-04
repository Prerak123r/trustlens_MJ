import { useEffect, useMemo, useState } from "react";

import { getAllClaims } from "../services/api";

function VerificationRuns() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        loadRuns();
    }, []);

    async function loadRuns() {
        try {
            setLoading(true);
            setError("");

            const response = await getAllClaims();

            setClaims(response.claims || []);
        } catch (err) {
            setError(
                err.message ||
                    "Failed to load verification runs."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==================================================
    // BUILD ALL VERIFICATION RUNS
    // ==================================================

    const allRuns = useMemo(() => {
        const runs = [];

        for (const claim of claims) {
            for (const run of claim.verification_runs || []) {
                runs.push({
                    ...run,

                    // Claim information
                    claim_id: claim.id,
                    claim_number: claim.claim_number,

                    // Evidence information
                    evidence_count:
                        claim.evidence_count || 0,
                });
            }
        }

        return runs.sort(
            (a, b) => b.id - a.id
        );
    }, [claims]);

    // ==================================================
    // FILTER VERIFICATION RUNS
    // ==================================================

    const filteredRuns = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return allRuns.filter((run) => {

            /*
             * IMPORTANT:
             *
             * Search is intentionally based ONLY on:
             * 1. Claim ID
             * 2. Claim Number
             *
             * We DO NOT search run.id here.
             *
             * Example:
             *
             * Search: 82
             *
             * Run #106 / Claim #82   -> SHOW
             * Run #105 / Claim #82   -> SHOW
             * Run #82  / Claim #61   -> DO NOT SHOW
             *
             * This prevents a Verification Run ID from
             * being confused with a Claim ID.
             */

            const matchesSearch =
                !normalizedSearch ||
                String(run.claim_id)
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                String(run.claim_number || "")
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "ALL" ||
                run.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        allRuns,
        search,
        statusFilter,
    ]);

    // ==================================================
    // METRICS
    // ==================================================

    const metrics = useMemo(() => {
        return {
            total: allRuns.length,

            completed: allRuns.filter(
                (run) =>
                    run.status === "COMPLETED"
            ).length,

            pending: allRuns.filter(
                (run) =>
                    run.status === "PENDING" ||
                    run.status === "RUNNING"
            ).length,

            failed: allRuns.filter(
                (run) =>
                    run.status === "FAILED" ||
                    run.status === "ERROR"
            ).length,
        };
    }, [allRuns]);

    // ==================================================
    // FORMAT DATE
    // ==================================================

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

    // ==================================================
    // FORMAT STATUS
    // ==================================================

    function formatStatus(status) {
        if (!status) {
            return "Unknown";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    }

    // ==================================================
    // STATUS CLASS
    // ==================================================

    function getStatusClass(status) {
        switch (status) {
            case "COMPLETED":
                return "status-success";

            case "FAILED":
            case "ERROR":
                return "status-danger";

            case "RUNNING":
            case "PENDING":
                return "status-warning";

            default:
                return "status-neutral";
        }
    }

    // ==================================================
    // OPEN VERIFICATION RUN
    // ==================================================

    function openRun(run) {
        window.dispatchEvent(
            new CustomEvent(
                "trustlens:open-verification-run",
                {
                    detail: {
                        claimId: run.claim_id,
                        runId: run.id,
                    },
                }
            )
        );
    }

    // ==================================================
    // LOADING STATE
    // ==================================================

    if (loading) {
        return (
            <div className="verification-runs-page">
                <div className="loading-card">
                    Loading verification runs...
                </div>
            </div>
        );
    }

    // ==================================================
    // ERROR STATE
    // ==================================================

    if (error) {
        return (
            <div className="verification-runs-page">
                <div className="admin-error">

                    <strong>
                        Unable to load verification runs
                    </strong>

                    <span>
                        {error}
                    </span>

                    <button
                        className="primary-button"
                        onClick={loadRuns}
                    >
                        Retry
                    </button>

                </div>
            </div>
        );
    }

    // ==================================================
    // MAIN PAGE
    // ==================================================

    return (
        <div className="verification-runs-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <section className="verification-runs-header">

                <div>

                    <div className="admin-section-label">
                        VERIFICATION OPERATIONS
                    </div>

                    <h2>
                        Verification Runs
                    </h2>

                    <p>
                        Monitor every TrustLens verification
                        run across submitted insurance claims.
                    </p>

                </div>

                <button
                    className="secondary-button"
                    onClick={loadRuns}
                >
                    Refresh Runs
                </button>

            </section>


            {/* ==========================================
                SUMMARY
            ========================================== */}

            <section className="runs-summary">

                <div className="runs-summary-card">

                    <div className="runs-summary-icon">
                        ◉
                    </div>

                    <div>
                        <span>
                            Total Runs
                        </span>

                        <strong>
                            {metrics.total}
                        </strong>
                    </div>

                </div>


                <div className="runs-summary-card">

                    <div className="runs-summary-icon success">
                        ✓
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {metrics.completed}
                        </strong>
                    </div>

                </div>


                <div className="runs-summary-card">

                    <div className="runs-summary-icon warning">
                        ◷
                    </div>

                    <div>
                        <span>
                            Pending / Active
                        </span>

                        <strong>
                            {metrics.pending}
                        </strong>
                    </div>

                </div>


                <div className="runs-summary-card">

                    <div className="runs-summary-icon danger">
                        !
                    </div>

                    <div>
                        <span>
                            Failed
                        </span>

                        <strong>
                            {metrics.failed}
                        </strong>
                    </div>

                </div>

            </section>


            {/* ==========================================
                RUN LIST
            ========================================== */}

            <section className="runs-list-card">

                <div className="runs-list-toolbar">

                    <div>

                        <div className="admin-section-label">
                            PIPELINE ACTIVITY
                        </div>

                        <h3>
                            All Verification Runs
                        </h3>

                    </div>


                    {/* ==================================
                        SEARCH + FILTER
                    ================================== */}

                    <div className="runs-filters">

                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Search Claim ID or Claim Number..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
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

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="RUNNING">
                                Running
                            </option>

                            <option value="FAILED">
                                Failed
                            </option>

                        </select>

                    </div>

                </div>


                {/* ==========================================
                    EMPTY RESULT
                ========================================== */}

                {filteredRuns.length === 0 ? (

                    <div className="runs-empty">

                        <div className="runs-empty-icon">
                            ◉
                        </div>

                        <h3>
                            No verification runs found
                        </h3>

                        <p>
                            Try changing your search or
                            status filter.
                        </p>

                    </div>

                ) : (

                    /* ======================================
                       TABLE
                    ====================================== */

                    <div className="runs-table-wrapper">

                        <table className="runs-table">

                            <thead>

                                <tr>

                                    <th>
                                        Run
                                    </th>

                                    <th>
                                        Claim
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Pipeline
                                    </th>

                                    <th>
                                        Evidence
                                    </th>

                                    <th>
                                        Started
                                    </th>

                                    <th>
                                        Completed
                                    </th>

                                    <th></th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredRuns.map(
                                    (run) => (

                                        <tr
                                            key={run.id}
                                        >

                                            {/* RUN */}

                                            <td>

                                                <strong>
                                                    #{run.id}
                                                </strong>

                                                <span>
                                                    Verification Run
                                                </span>

                                            </td>


                                            {/* CLAIM */}

                                            <td>

                                                <strong>
                                                    {run.claim_number ||
                                                        "—"}
                                                </strong>

                                                <span>
                                                    Claim #
                                                    {run.claim_id}
                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`status-pill ${getStatusClass(
                                                        run.status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        run.status
                                                    )}
                                                </span>

                                            </td>


                                            {/* PIPELINE */}

                                            <td>

                                                <span className="pipeline-version">
                                                    {run.pipeline_version ||
                                                        "—"}
                                                </span>

                                            </td>


                                            {/* EVIDENCE */}

                                            <td>

                                                <span className="run-evidence">
                                                    {run.evidence_count}{" "}
                                                    files
                                                </span>

                                            </td>


                                            {/* STARTED */}

                                            <td>

                                                <span className="run-date">
                                                    {formatDate(
                                                        run.started_at
                                                    )}
                                                </span>

                                            </td>


                                            {/* COMPLETED */}

                                            <td>

                                                <span className="run-date">
                                                    {formatDate(
                                                        run.completed_at
                                                    )}
                                                </span>

                                            </td>


                                            {/* OPEN */}

                                            <td>

                                                <button
                                                    className="small-button"
                                                    onClick={() =>
                                                        openRun(
                                                            run
                                                        )
                                                    }
                                                >
                                                    Open
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}


                {/* ==========================================
                    FOOTER
                ========================================== */}

                <div className="runs-list-footer">

                    Showing{" "}

                    <strong>
                        {filteredRuns.length}
                    </strong>{" "}

                    of{" "}

                    <strong>
                        {allRuns.length}
                    </strong>{" "}

                    verification runs

                </div>

            </section>

        </div>
    );
}

export default VerificationRuns;