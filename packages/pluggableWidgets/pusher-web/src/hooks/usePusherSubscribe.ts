import { useEffect } from "react";
import { usePusherListener } from "./usePusherListener";
import { SubscriptionConfig } from "../utils/PusherListener";

/**
 * Manages the full Pusher listener lifecycle: config fetching, initialization,
 * and subscription. Resubscribes automatically when subscription changes.
 */
export function usePusherSubscribe(subscription?: SubscriptionConfig): void {
    const listener = usePusherListener();

    useEffect(() => {
        if (!listener || !subscription) {
            return;
        }
        listener.subscribe(subscription);
        return () => {
            listener.unsubscribe();
        };
    }, [listener, subscription]);
}
