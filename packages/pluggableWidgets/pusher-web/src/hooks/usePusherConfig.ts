import { useEffect, useState } from "react";
import { PusherConfig } from "../utils/PusherListener";

interface KeyData {
    key: string;
    cluster: string;
}

/**
 * Fetch Pusher configuration from backend
 * Returns null while loading or on error
 */
export function usePusherConfig(): PusherConfig | null {
    const [config, setConfig] = useState<PusherConfig | null>(null);

    useEffect(() => {
        const baseUrl = (window as any).mx?.remoteUrl || (window as any).mx?.appUrl || "";
        const endpoint = `${baseUrl}rest/pusher/key`;
        const csrfToken = (window as any).mx?.sessionData?.csrftoken || "";

        const authEndpoint = `${baseUrl}rest/pusher/auth`;

        fetch(endpoint, {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "X-Csrf-Token": csrfToken
            }
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error(`Failed to fetch Pusher key: HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const keyData = JSON.parse(data) as KeyData;
                if (!keyData.key || !keyData.cluster) {
                    throw new Error("Invalid Pusher key data: missing key or cluster");
                }
                setConfig({
                    key: keyData.key,
                    cluster: keyData.cluster,
                    authEndpoint,
                    csrfToken
                });
            })
            .catch(error => {
                console.error("[usePusherConfig] Failed to fetch Pusher configuration:", error);
                setConfig(null);
            });
    }, []);

    return config;
}
