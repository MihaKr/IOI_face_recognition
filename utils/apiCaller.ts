export const webuiServerUrl = 'http://127.0.0.1:7860';

export const callApi = async (apiEndpoint: string, payload: Record<string, any>): Promise<any> => {
    const response = await fetch(`${webuiServerUrl}/${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
    }

    return response.json();
};
