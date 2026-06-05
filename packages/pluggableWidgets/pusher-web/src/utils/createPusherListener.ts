import { fetchPusherConfig } from "./fetchPusherConfig";
import { PusherListener } from "./PusherListener";

/**
 * Fetches Pusher configuration and creates a ready-to-use PusherListener.
 * Returns null if the config fetch fails or the request is aborted.
 */
export async function createPusherListener(signal: AbortSignal): Promise<PusherListener | null> {
    const config = await fetchPusherConfig(signal);
    if (!config) {
        return null;
    }
    return new PusherListener(config);
}
