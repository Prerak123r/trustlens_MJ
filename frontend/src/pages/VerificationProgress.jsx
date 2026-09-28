import { useEffect, useState } from "react";

import {
    getVerificationRun
} from "../services/verificationService";


function VerificationProgress({ runId }) {

    const [verification, setVerification] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        async function loadVerification() {

            try {

                setLoading(true);

                const data =
                    await getVerificationRun(runId);

                setVerification(data);

            } catch (error) {

                console.error(error);

                setError(error.message);

            } finally {

                setLoading(false);
            }
        }


        loadVerification();

    }, [runId]);


    if (loading) {

        return (
            <div>
                <h2>Loading verification...</h2>
            </div>
        );
    }


    if (error) {

        return (
            <div>

                <h2>Verification Error</h2>

                <p>{error}</p>

            </div>
        );
    }


    if (!verification) {

        return null;
    }


    return (

        <div>

            <h1>TrustLens</h1>

            <p>
                Multimodal Claim Evidence Verification
            </p>

            <hr />


            <h2>Verification Progress</h2>


            <p>
                <strong>
                    Verification Run:
                </strong>{" "}

                #{verification.id}
            </p>


            <p>
                <strong>
                    Status:
                </strong>{" "}

                {verification.status}
            </p>


            <hr />


            <h2>Analysis Pipeline</h2>


            <div>

                {verification.analysis_results.map(
                    (analysis) => (

                        <AnalysisStage
                            key={analysis.id}
                            analysis={analysis}
                        />

                    )
                )}

            </div>

        </div>
    );
}


function AnalysisStage({ analysis }) {

    const isPending =
        analysis.status === "PENDING";


    return (

        <div
            style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px"
            }}
        >

            <h3>
                {formatAnalysisName(
                    analysis.analysis_type
                )}
            </h3>


            <p>

                <strong>
                    Status:
                </strong>{" "}

                {isPending
                    ? "Pending"
                    : analysis.status}

            </p>


            {analysis.message && (

                <p>
                    {analysis.message}
                </p>

            )}

        </div>
    );
}


function formatAnalysisName(name) {

    return name
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


export default VerificationProgress;