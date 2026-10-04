import { useState } from "react";

import { createClaim } from "../services/api";
import { uploadEvidence } from "../services/uploadService";
import { startVerification } from "../services/verificationService";

import ClaimDashboard from "./ClaimDashboard";
import VerificationProgress from "./VerificationProgress";


function NewClaim() {

    const [claim, setClaim] = useState(null);

    const [showDashboard, setShowDashboard] =
        useState(false);

    const [showVerification, setShowVerification] =
        useState(false);

    const [verificationRunId, setVerificationRunId] =
        useState(null);


    const [invoiceFile, setInvoiceFile] =
        useState(null);

    const [productFile, setProductFile] =
        useState(null);

    const [damageFile, setDamageFile] =
        useState(null);


    const [uploading, setUploading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // --------------------------------
    // CREATE CLAIM
    // --------------------------------

    async function handleCreateClaim() {

        try {

            setError("");
            setMessage("");

            const data = await createClaim();

            setClaim(data);

            localStorage.setItem(
                "trustlens_last_claim_id",
                String(data.id)
            );

            setMessage(
                `Claim created successfully: ${data.claim_number}`
            );

        } catch (error) {

            console.error(error);

            setError(error.message);
        }
    }


    // --------------------------------
    // UPLOAD EVIDENCE
    // --------------------------------

    async function handleUpload(
        evidenceType,
        file
    ) {

        if (!claim) {

            setError(
                "Please create a claim first."
            );

            return;
        }


        if (!file) {

            setError(
                `Please select a ${evidenceType} file.`
            );

            return;
        }


        try {

            setUploading(true);

            setError("");
            setMessage("");


            await uploadEvidence(
                claim.id,
                evidenceType,
                file
            );


            setMessage(
                `${evidenceType} uploaded successfully.`
            );


        } catch (error) {

            console.error(error);

            setError(error.message);


        } finally {

            setUploading(false);
        }
    }


    // --------------------------------
    // START VERIFICATION
    // --------------------------------

    async function handleStartVerification() {

        if (!claim) {

            setError(
                "No claim available."
            );

            return;
        }


        try {

            setError("");

            setMessage(
                "Starting verification..."
            );


            const result =
                await startVerification(
                    claim.id
                );


            setVerificationRunId(
                result.verification_run_id
            );


            setShowVerification(true);

            setShowDashboard(false);


        } catch (error) {

            console.error(error);

            setError(error.message);
        }
    }


    // --------------------------------
    // VERIFICATION PAGE
    // --------------------------------

    if (
        showVerification &&
        verificationRunId
    ) {

        return (
            <VerificationProgress
                runId={verificationRunId}
            />
        );
    }


    // --------------------------------
    // CLAIM DASHBOARD
    // --------------------------------

    if (
        showDashboard &&
        claim
    ) {

        return (
            <ClaimDashboard
                claimId={claim.id}
                onStartVerification={
                    handleStartVerification
                }
            />
        );
    }


    // --------------------------------
    // MAIN CLAIM PAGE
    // --------------------------------

    return (

        <div className="page-container">

            {/* HERO */}

            <section className="hero-card clay-card">

                <div className="hero-copy">

                    <span className="eyebrow">
                        INSURANCE CLAIM PORTAL
                    </span>


                    <h1>
                        Submit your claim.
                        <br />
                        Let the evidence speak.
                    </h1>


                    <p>
                        TrustLens analyzes claim evidence
                        across documents, images and
                        verification signals to support
                        insurance review.
                    </p>


                    {!claim && (

                        <button
                            className="primary-btn"
                            onClick={handleCreateClaim}
                        >
                            <span>＋</span>

                            Create New Claim
                        </button>

                    )}

                </div>


                <div className="hero-orb">

                    <div className="orb-inner">
                        <span>TL</span>
                    </div>

                </div>

            </section>


            {/* CLAIM INFORMATION */}

            {claim && (

                <section className="claim-strip clay-card">

                    <div>

                        <span className="muted-label">
                            CLAIM NUMBER
                        </span>

                        <strong>
                            {claim.claim_number}
                        </strong>

                    </div>


                    <div>

                        <span className="muted-label">
                            STATUS
                        </span>

                        <span className="status-pill pending">
                            {claim.status}
                        </span>

                    </div>

                </section>

            )}


            {/* EVIDENCE */}

            {claim && (

                <>

                    <section className="section-heading">

                        <div>

                            <span className="eyebrow">
                                STEP 01 — EVIDENCE
                            </span>

                            <h2>
                                Upload claim evidence
                            </h2>

                            <p>
                                Add the documents and images
                                that support your insurance
                                claim.
                            </p>

                        </div>

                    </section>


                    <div className="evidence-grid">

                        <UploadCard
                            number="01"
                            title="Invoice"
                            description="Upload your purchase invoice or bill."
                            file={invoiceFile}
                            setFile={setInvoiceFile}
                            onUpload={() =>
                                handleUpload(
                                    "invoice",
                                    invoiceFile
                                )
                            }
                            uploading={uploading}
                            icon="▤"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                        />


                        <UploadCard
                            number="02"
                            title="Product"
                            description="Add a clear image of the product."
                            file={productFile}
                            setFile={setProductFile}
                            onUpload={() =>
                                handleUpload(
                                    "product",
                                    productFile
                                )
                            }
                            uploading={uploading}
                            icon="◇"
                            accept=".jpg,.jpeg,.png,.webp"
                        />


                        <UploadCard
                            number="03"
                            title="Damage"
                            description="Show the damaged area clearly."
                            file={damageFile}
                            setFile={setDamageFile}
                            onUpload={() =>
                                handleUpload(
                                    "damage",
                                    damageFile
                                )
                            }
                            uploading={uploading}
                            icon="◈"
                            accept=".jpg,.jpeg,.png,.webp"
                        />

                    </div>


                    {/* NEXT STEP */}

                    <section className="action-panel clay-card">

                        <div>

                            <span className="eyebrow">
                                READY FOR REVIEW?
                            </span>

                            <h3>
                                View your claim before verification
                            </h3>

                            <p>
                                Make sure all available evidence
                                has been uploaded before starting
                                the verification pipeline.
                            </p>

                        </div>


                        <button
                            className="secondary-btn"
                            onClick={() =>
                                setShowDashboard(true)
                            }
                        >
                            View Claim Dashboard →
                        </button>

                    </section>

                </>

            )}


            {/* MESSAGES */}

            {uploading && (

                <div className="toast info">
                    Uploading evidence...
                </div>

            )}


            {message && (

                <div className="toast success">
                    ✓ {message}
                </div>

            )}


            {error && (

                <div className="toast error">
                    ! {error}
                </div>

            )}

        </div>
    );
}


// ========================================
// UPLOAD CARD
// ========================================

function UploadCard({
    number,
    title,
    description,
    file,
    setFile,
    onUpload,
    uploading,
    icon,
    accept
}) {

    return (

        <div className="upload-card clay-card">

            <div className="upload-card-top">

                <span className="step-number">
                    {number}
                </span>

                <span className="upload-icon">
                    {icon}
                </span>

            </div>


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            <label className="file-drop">

                <input
                    type="file"
                    accept={accept}
                    onChange={(event) =>
                        setFile(
                            event.target.files[0]
                        )
                    }
                />


                <span className="upload-arrow">
                    ↑
                </span>


                <strong>
                    {file
                        ? file.name
                        : "Choose a file"}
                </strong>


                <small>
                    {file
                        ? "Ready to upload"
                        : "JPG, PNG or PDF"}
                </small>

            </label>


            <button
                className="small-btn"
                onClick={onUpload}
                disabled={
                    uploading ||
                    !file
                }
            >
                Upload {title}
            </button>

        </div>
    );
}


export default NewClaim;