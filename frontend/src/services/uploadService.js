const API_BASE_URL = "http://127.0.0.1:8000";


export async function uploadEvidence(
    claimId,
    evidenceType,
    file
) {

    const formData = new FormData();

    formData.append("file", file);


    const response = await fetch(
        `${API_BASE_URL}/claims/${claimId}/upload/${evidenceType}`,
        {
            method: "POST",
            body: formData
        }
    );


    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Upload failed"
        );
    }


    return await response.json();
}