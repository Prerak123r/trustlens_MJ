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
    // MAIN NEW CLAIM PAGE
    // --------------------------------

    return (

        <div>

            <h1>TrustLens</h1>

            <p>
                Multimodal Claim Evidence Verification
            </p>

            <hr />


            <h2>Create New Claim</h2>


            {!claim && (

                <button
                    onClick={handleCreateClaim}
                >
                    Create Claim
                </button>

            )}


            {claim && (

                <div>

                    <h3>
                        Claim Created
                    </h3>


                    <p>

                        <strong>
                            Claim Number:
                        </strong>{" "}

                        {claim.claim_number}

                    </p>


                    <p>

                        <strong>
                            Status:
                        </strong>{" "}

                        {claim.status}

                    </p>

                </div>

            )}


            <hr />


            {claim && (

                <div>

                    <h2>
                        Upload Evidence
                    </h2>


                    {/* ========================= */}
                    {/* INVOICE */}
                    {/* ========================= */}

                    <div>

                        <h3>
                            1. Invoice
                        </h3>


                        <input
                            type="file"

                            accept=".jpg,.jpeg,.png,.webp,.pdf"

                            onChange={(event) =>
                                setInvoiceFile(
                                    event.target.files[0]
                                )
                            }
                        />


                        <button

                            onClick={() =>
                                handleUpload(
                                    "invoice",
                                    invoiceFile
                                )
                            }

                            disabled={uploading}

                        >
                            Upload Invoice
                        </button>

                    </div>


                    <br />


                    {/* ========================= */}
                    {/* PRODUCT */}
                    {/* ========================= */}

                    <div>

                        <h3>
                            2. Product Image
                        </h3>


                        <input
                            type="file"

                            accept=".jpg,.jpeg,.png,.webp"

                            onChange={(event) =>
                                setProductFile(
                                    event.target.files[0]
                                )
                            }
                        />


                        <button

                            onClick={() =>
                                handleUpload(
                                    "product",
                                    productFile
                                )
                            }

                            disabled={uploading}

                        >
                            Upload Product Image
                        </button>

                    </div>


                    <br />


                    {/* ========================= */}
                    {/* DAMAGE */}
                    {/* ========================= */}

                    <div>

                        <h3>
                            3. Damage Image
                        </h3>


                        <input
                            type="file"

                            accept=".jpg,.jpeg,.png,.webp"

                            onChange={(event) =>
                                setDamageFile(
                                    event.target.files[0]
                                )
                            }
                        />


                        <button

                            onClick={() =>
                                handleUpload(
                                    "damage",
                                    damageFile
                                )
                            }

                            disabled={uploading}

                        >
                            Upload Damage Image
                        </button>

                    </div>


                    <br />


                    {uploading && (

                        <p>
                            Uploading...
                        </p>

                    )}


                    <hr />


                    {/* ========================= */}
                    {/* DASHBOARD BUTTON */}
                    {/* ========================= */}

                    <button

                        onClick={() =>
                            setShowDashboard(true)
                        }

                    >
                        View Claim Dashboard

                    </button>

                </div>

            )}


            {/* ========================= */}
            {/* SUCCESS MESSAGE */}
            {/* ========================= */}

            {message && (

                <div>

                    <p>
                        {message}
                    </p>

                </div>

            )}


            {/* ========================= */}
            {/* ERROR MESSAGE */}
            {/* ========================= */}

            {error && (

                <div>

                    <p>
                        Error: {error}
                    </p>

                </div>

            )}

        </div>
    );
}


export default NewClaim;