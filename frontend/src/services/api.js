const API_BASE_URL = "http://127.0.0.1:8000";


export async function createClaim() {

    const response = await fetch(
        `${API_BASE_URL}/claims/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to create claim"
        );
    }

    return await response.json();
}


export async function getClaim(claimId) {

    const response = await fetch(
        `${API_BASE_URL}/claims/${claimId}`
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to fetch claim"
        );
    }

    return await response.json();
}

export async function getAllClaims() {
    const response = await fetch(
        "http://127.0.0.1:8000/claims/"
    );

    if (!response.ok) {
        let message = "Failed to load claims.";

        try {
            const errorData = await response.json();
            message = errorData.detail || message;
        } catch {}

        throw new Error(message);
    }

    return await response.json();
}