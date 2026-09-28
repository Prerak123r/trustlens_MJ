import { useEffect, useState } from "react";

import { getClaim } from "../services/api";


function ClaimDashboard({ claimId, onStartVerification }) {

    const [claim, setClaim] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        async function loadClaim() {

            try {

                setLoading(true);

                const data = await getClaim(
                    claimId
                );

                setClaim(data);

            } catch (error) {

                console.error(error);

                setError(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }


        loadClaim();

    }, [claimId]);


    if (loading) {

        return (
            <div>
                Loading claim...
            </div>
        );
    }


    if (error) {

        return (
            <div>
                <h2>Error</h2>

                <p>{error}</p>
            </div>
        );
    }


    if (!claim) {
        return null;
    }


    const invoice = claim.evidence.find(
        item => item.type === "invoice"
    );

    const product = claim.evidence.find(
        item => item.type === "product"
    );

    const damage = claim.evidence.find(
        item => item.type === "damage"
    );


    return (

        <div>

            <h1>
                TrustLens
            </h1>


            <p>
                Multimodal Claim Evidence Verification
            </p>


            <hr />


            <h2>
                Claim Details
            </h2>


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


            <hr />


            <h2>
                Evidence
            </h2>


            <div>

                <EvidenceCard
                    title="Invoice"
                    evidence={invoice}
                />


                <EvidenceCard
                    title="Product"
                    evidence={product}
                />


                <EvidenceCard
                    title="Damage"
                    evidence={damage}
                />

            </div>


            <hr />


            <button
                onClick={onStartVerification}
            >

                Start Verification

            </button>

        </div>
    );
}


function EvidenceCard({
    title,
    evidence
}) {

    return (

        <div>

            <h3>
                {title}
            </h3>


            {evidence ? (

                <div>

                    <p>
                        ✓ Uploaded
                    </p>

                    <p>
                        {evidence.original_filename}
                    </p>

                </div>

            ) : (

                <div>

                    <p>
                        ⚠ Not uploaded
                    </p>

                </div>

            )}

        </div>
    );
}


export default ClaimDashboard;