const API_BASE_URL =
    "http://127.0.0.1:8000";


// ============================================================
// START VERIFICATION
// ============================================================

export async function startVerification(
    claimId
) {

    const response =
        await fetch(
            `${API_BASE_URL}/claims/${claimId}/verify`,
            {
                method: "POST"
            }
        );


    if (!response.ok) {

        let message =
            "Failed to start verification.";

        try {

            const errorData =
                await response.json();

            message =
                errorData.detail ||
                message;

        } catch {
            // Keep default message.
        }

        throw new Error(
            message
        );
    }


    return await response.json();
}


// ============================================================
// GET SINGLE VERIFICATION RUN
// ============================================================

export async function getVerificationRun(
    runId
) {

    const response =
        await fetch(
            `${API_BASE_URL}/claims/verification/${runId}`
        );


    if (!response.ok) {

        let message =
            "Failed to load verification run.";

        try {

            const errorData =
                await response.json();

            message =
                errorData.detail ||
                message;

        } catch {
            // Keep default message.
        }

        throw new Error(
            message
        );
    }


    return await response.json();
}


// ============================================================
// GET ALL VERIFICATION RUNS FOR A CLAIM
// ============================================================

export async function getClaimVerificationRuns(
    claimId
) {

    const response =
        await fetch(
            `${API_BASE_URL}/claims/${claimId}/verification-runs`
        );


    if (!response.ok) {

        let message =
            "Failed to load verification runs.";

        try {

            const errorData =
                await response.json();

            message =
                errorData.detail ||
                message;

        } catch {
            // Keep default message.
        }

        throw new Error(
            message
        );
    }


    return await response.json();
}