import { useEffect, useRef, useState } from "react";
import { useFetchPusherConfig } from "./useFetchPusherConfig";
import { PusherListener } from "../utils/PusherListener";

/**
 * Creates and initializes a PusherListener
 */
export function usePusherListener(): PusherListener | null {
    const instanceRef = useRef<PusherListener>(null);
    const [ready, setReady] = useState(false);

    const pusherConfig = useFetchPusherConfig();

    useEffect(() => {
        if (!pusherConfig) {
            return;
        }
        try {
            const instance = new PusherListener(pusherConfig);
            instance.initialize();
            instanceRef.current = instance;
            setReady(true);
        } catch (error) {
            console.error("[usePusherListenerInstance] Failed to initialize:", error);
            return;
        }
        return () => {
            instanceRef.current?.destroy();
            instanceRef.current = null;
            setReady(false);
        };
    }, [pusherConfig]);

    return ready ? instanceRef.current : null;
}
