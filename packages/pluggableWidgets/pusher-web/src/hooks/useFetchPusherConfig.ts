import { useEffect, useState } from "react";
import { fetchPusherConfig } from "../utils/fetchPusherConfig";
import { PusherConfig } from "../utils/PusherListener";

/**
 * Provides Pusher configuration fetched from the backend.
 * Returns null while loading or on error.
 */
export function useFetchPusherConfig(): PusherConfig | null {
    const [config, setConfig] = useState<PusherConfig | null>(null);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        fetchPusherConfig(controller.signal).then(result => {
            if (active) {
                setConfig(result);
            }
        });

        return () => {
            active = false;
            controller.abort();
        };
    }, []);

    return config;
}
