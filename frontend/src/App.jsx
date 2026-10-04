import { useEffect, useState } from "react";

import NewClaim from "./pages/NewClaim";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/AdminOverview";
import ReviewQueue from "./pages/ReviewQueue";
import VerificationRuns from "./pages/VerificationRuns";

import "./styles/trustlens.css";

function App() {
    const [mode, setMode] = useState("user");
    const [adminSection, setAdminSection] = useState("dashboard");
    const [adminClaimId, setAdminClaimId] = useState("");
    const [adminRunId, setAdminRunId] = useState(null);

    const isAdmin = mode === "admin";

    const adminNavigation = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "▦",
        },
        {
            id: "claims",
            label: "All Claims",
            icon: "▤",
        },
        {
            id: "review",
            label: "Review Queue",
            icon: "⚑",
        },
        {
            id: "runs",
            label: "Verification Runs",
            icon: "◉",
        },
        {
            id: "reports",
            label: "Reports",
            icon: "▥",
        },
        {
            id: "settings",
            label: "Settings",
            icon: "⚙",
        },
    ];

    /*
     * ==================================================
     * OPEN VERIFICATION RUN FROM VERIFICATION RUNS PAGE
     * ==================================================
     *
     * VerificationRuns.jsx dispatches:
     *
     * trustlens:open-verification-run
     *
     * with:
     * {
     *     claimId,
     *     runId
     * }
     *
     * App.jsx owns this event because AdminDashboard is
     * not mounted while the Verification Runs page is open.
     */

    useEffect(() => {
        function handleOpenVerificationRun(event) {
            const claimId = event.detail?.claimId;
            const runId = event.detail?.runId;

            if (!claimId || !runId) {
                return;
            }

            setAdminClaimId(String(claimId));
            setAdminRunId(Number(runId));
            setAdminSection("claims");
            setMode("admin");
        }

        window.addEventListener(
            "trustlens:open-verification-run",
            handleOpenVerificationRun
        );

        return () => {
            window.removeEventListener(
                "trustlens:open-verification-run",
                handleOpenVerificationRun
            );
        };
    }, []);

    function renderAdminContent() {
        if (adminSection === "dashboard") {
            return <AdminOverview />;
        }

        if (adminSection === "claims") {
            return (
                <AdminDashboard
                    claimId={adminClaimId}
                    setClaimId={setAdminClaimId}
                    requestedRunId={adminRunId}
                />
            );
        }

        if (adminSection === "review") {
            return <ReviewQueue />;
        }

        if (adminSection === "runs") {
            return <VerificationRuns />;
        }

        const sectionTitles = {
            reports: "Reports",
            settings: "Settings",
        };

        return (
            <div className="admin-placeholder-card">
                <div className="admin-placeholder-icon">
                    {
                        adminNavigation.find(
                            (item) => item.id === adminSection
                        )?.icon
                    }
                </div>

                <div>
                    <h2>{sectionTitles[adminSection]}</h2>

                    <p>
                        This admin module will be implemented in the next
                        TrustLens UI stage.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={
                isAdmin
                    ? "app-shell admin-shell"
                    : "app-shell claimant-shell"
            }
        >
            {isAdmin ? (
                <>
                    <aside className="admin-sidebar">
                        <div className="admin-sidebar-brand">
                            <div className="brand-mark">TL</div>

                            <div>
                                <div className="brand-name">
                                    TrustLens AI
                                </div>

                                <div className="brand-subtitle">
                                    Insurance Operations
                                </div>
                            </div>
                        </div>

                        <div className="admin-sidebar-label">
                            OPERATIONS
                        </div>

                        <nav className="admin-nav">
                            {adminNavigation.map((item) => (
                                <button
                                    key={item.id}
                                    className={
                                        adminSection === item.id
                                            ? "admin-nav-item active"
                                            : "admin-nav-item"
                                    }
                                    onClick={() => {
                                        setAdminSection(item.id);

                                        /*
                                         * Clear a previously requested
                                         * verification run when the admin
                                         * intentionally navigates elsewhere.
                                         */
                                        if (item.id !== "claims") {
                                            setAdminRunId(null);
                                        }
                                    }}
                                >
                                    <span className="admin-nav-icon">
                                        {item.icon}
                                    </span>

                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="admin-sidebar-bottom">
                            <div className="admin-system-status">
                                <span className="status-dot"></span>

                                <div>
                                    <strong>System Online</strong>

                                    <small>
                                        Verification engine ready
                                    </small>
                                </div>
                            </div>

                            <button
                                className="claimant-switch-button"
                                onClick={() => {
                                    setMode("user");
                                    setAdminSection("dashboard");
                                    setAdminClaimId("");
                                    setAdminRunId(null);
                                }}
                            >
                                <span>←</span>
                                Switch to Claimant
                            </button>
                        </div>
                    </aside>

                    <div className="admin-main-shell">
                        <header className="admin-topbar">
                            <div>
                                <div className="admin-breadcrumb">
                                    INSURANCE OPERATIONS
                                </div>

                                <h1>
                                    {adminNavigation.find(
                                        (item) =>
                                            item.id === adminSection
                                    )?.label || "Dashboard"}
                                </h1>
                            </div>

                            <div className="admin-topbar-right">
                                <div className="admin-user-info">
                                    <div className="admin-avatar">
                                        AD
                                    </div>

                                    <div>
                                        <strong>Admin</strong>

                                        <span>
                                            Insurance Operations
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="admin-main-content">
                            {renderAdminContent()}
                        </main>

                        <footer className="admin-footer">
                            TrustLens AI • Insurance Operations Console
                        </footer>
                    </div>
                </>
            ) : (
                <>
                    <header className="topbar">
                        <div className="brand">
                            <div className="brand-mark">TL</div>

                            <div>
                                <div className="brand-name">
                                    TrustLens AI
                                </div>

                                <div className="brand-subtitle">
                                    Claimant Portal
                                </div>
                            </div>
                        </div>

                        <button
                            className="mode-btn"
                            onClick={() => {
                                setMode("admin");
                                setAdminSection("dashboard");
                            }}
                        >
                            Insurance Admin
                        </button>
                    </header>

                    <main className="main-content">
                        <NewClaim />
                    </main>

                    <footer className="footer">
                        TrustLens AI • Multimodal Insurance Claim Verification
                    </footer>
                </>
            )}
        </div>
    );
}

export default App;