const API_BASE_URL = "http://127.0.0.1:8000";


export async function startVerification(claimId) {

    const response = await fetch(
        `${API_BASE_URL}/claims/${claimId}/verify`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to start verification"
        );
    }

    return await response.json();
}


export async function getVerificationRun(runId) {

    const response = await fetch(
        `${API_BASE_URL}/claims/verification/${runId}`
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to fetch verification"
        );
    }

    return await response.json();
}