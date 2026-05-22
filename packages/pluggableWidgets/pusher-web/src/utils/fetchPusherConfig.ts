import { PusherConfig } from "./PusherListener";

interface KeyData {
    key: string;
    cluster: string;
}

/**
 * Fetches Pusher configuration from the backend.
 * Returns a PusherConfig on success, or null on error / invalid response.
 */
export async function fetchPusherConfig(signal: AbortSignal): Promise<PusherConfig | null> {
    const baseUrl = (window as any).mx?.remoteUrl || (window as any).mx?.appUrl || "";
    const endpoint = `${baseUrl}rest/pusher/key`;
    const csrfToken = (window as any).mx?.sessionData?.csrftoken || "";
    const authEndpoint = `${baseUrl}rest/pusher/auth`;

    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: "GET",
            credentials: "same-origin",
            headers: { "X-Csrf-Token": csrfToken },
            signal
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return null;
        }
        console.error("[fetchPusherConfig] Network error:", error);
        return null;
    }

    if (response.status !== 200) {
        console.error(`[fetchPusherConfig] Unexpected response: HTTP ${response.status}`);
        return null;
    }

    let keyData: KeyData;
    try {
        keyData = JSON.parse(await response.text()) as KeyData;
    } catch (error) {
        console.error("[fetchPusherConfig] Failed to parse response:", error);
        return null;
    }

    if (!keyData.key || !keyData.cluster) {
        console.error("[fetchPusherConfig] Invalid response: missing key or cluster");
        return null;
    }

    return { key: keyData.key, cluster: keyData.cluster, authEndpoint, csrfToken };
}
