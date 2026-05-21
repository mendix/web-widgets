import { useEffect, useRef } from "react";
import { usePusherConfig } from "./usePusherConfig";
import { PusherListener, SubscriptionConfig } from "../utils/PusherListener";

/**
 * React hook to manage Pusher listener lifecycle
 * Automatically handles initialization, subscription changes, and cleanup
 */
export function usePusherListener(subscription?: SubscriptionConfig): void {
    const listenerRef = useRef<PusherListener | null>(null);

    // Fetch Pusher config from backend
    const pusherConfig = usePusherConfig();

    const enabled = !!pusherConfig && !!subscription;

    // Initialize PusherListener once when config is available
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const listener = new PusherListener(pusherConfig);
        listenerRef.current = listener;

        listener.initialize().catch(error => {
            console.error("[usePusherListener] Failed to initialize:", error);
        });

        // Cleanup on unmount or when config changes
        return () => {
            listener.destroy();
            listenerRef.current = null;
        };
    }, [pusherConfig, enabled]);

    // Subscribe/unsubscribe based on subscription config changes
    useEffect(() => {
        const listener = listenerRef.current;
        if (!listener || !subscription) {
            return;
        }

        listener.subscribe(subscription);

        // Unsubscribe on cleanup or when subscription changes
        return () => {
            listener.unsubscribe();
        };
    }, [subscription]);
}
