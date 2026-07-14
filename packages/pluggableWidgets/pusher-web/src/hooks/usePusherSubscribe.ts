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
        let listenerInstance: PusherListener | null = null;

        createPusherListener(controller.signal).then(result => {
            if (controller.signal.aborted) {
                result?.destroy();
                return;
            }
            listenerInstance = result;

            setListener(listenerInstance);
        });

        return () => {
            controller.abort();
            listenerInstance?.destroy();
            setListener(null);
        };
    }, []);

    useEffect(() => {
        if (!listener) {
            return;
        }

        if (!subscription) {
            listener.unsubscribe();
        } else {
            listener.subscribe(subscription);
        }
    }, [listener, subscription]);
}
