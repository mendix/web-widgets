import { useEffect, useState } from "react";
import { createPusherListener } from "../utils/createPusherListener";
import { PusherListener, SubscriptionConfig } from "../utils/PusherListener";

/**
 * Manages the full Pusher lifecycle: fetches config, creates the listener
 * instance, and manages the channel subscription.
 * Resubscribes automatically when the subscription config changes.
 */
export function usePusherSubscribe(subscription?: SubscriptionConfig): void {
    const [listener, setListener] = useState<PusherListener | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let instance: PusherListener | null = null;

        createPusherListener(controller.signal).then(result => {
            if (controller.signal.aborted) {
                result?.destroy();
                return;
            }
            instance = result;
            setListener(result);
        });

        return () => {
            controller.abort();
            instance?.destroy();
            setListener(null);
        };
    }, []);

    useEffect(() => {
        if (!listener) {
            return;
        }
        if (!subscription) {
            listener.unsubscribe();
            return;
        }

        listener.subscribe(subscription);
        return () => {
            listener.unsubscribe();
        };
    }, [listener, subscription]);
}
