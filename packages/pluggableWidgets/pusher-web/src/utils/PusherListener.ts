import Pusher, { Channel } from "pusher-js";

export interface PusherConfig {
    key: string;
    cluster: string;
    authEndpoint: string;
    csrfToken: string;
}

export interface EventBinding {
    eventName: string;
    onEvent: () => void;
}

export interface SubscriptionConfig {
    channelName: string;
    eventBindings: EventBinding[];
    onError?: (error: Error) => void;
}

export class PusherListener {
    private pusher: Pusher;
    private currentChannel: Channel | null = null;
    private currentChannelName: string | null = null;
    private eventHandlersMap: Map<string, () => void> = new Map();
    private globalCallback: ((eventName: string, data: unknown) => void) | null = null;
    private onError?: (error: Error) => void;

    constructor(private config: PusherConfig) {
        this.pusher = new Pusher(this.config.key, {
            cluster: this.config.cluster,
            authEndpoint: this.config.authEndpoint,
            auth: {
                headers: {
                    "X-Csrf-Token": this.config.csrfToken
                }
            }
        });

        // Setup connection event handlers
        this.pusher.connection.bind("error", this.handleConnectionError);
        this.pusher.connection.bind("state_change", this.handleStateChange);
    }

    /**
     * Subscribe to channel for specific object and bind multiple events
     * Only resubscribes when channel name changes, not when handlers change
     */
    subscribe(config: SubscriptionConfig): void {
        // Only resubscribe if channel name changes
        if (config.channelName !== this.currentChannelName) {
            this.unsubscribe();
            this.currentChannelName = config.channelName;
            this.currentChannel = this.pusher.subscribe(config.channelName);

            // Setup global handler once per channel
            this.globalCallback = (eventName: string, _data: unknown) => {
                const handler = this.eventHandlersMap.get(eventName);
                if (handler) {
                    handler();
                }
            };
            this.currentChannel.bind_global(this.globalCallback);

            // Bind error handler
            this.currentChannel.bind("pusher:subscription_error", (error: unknown) => {
                console.error(error);
                const errorMsg =
                    error === 515
                        ? "Authentication failed. Please verify Pusher configuration constants."
                        : `Subscription error: ${String(error)}`;
                this.onError?.(new Error(errorMsg));
            });
        }

        // Always update handler map (no rebinding needed)
        this.eventHandlersMap.clear();
        config.eventBindings.forEach(binding => {
            this.eventHandlersMap.set(binding.eventName, binding.onEvent);
        });

        // Store error handler for reference
        this.onError = config.onError;
    }

    /**
     * Unsubscribe from current channel
     */
    unsubscribe(): void {
        if (this.currentChannel && this.currentChannelName) {
            // Unbind all channel events (both global and specific)
            this.currentChannel.unbind_all();
            this.pusher.unsubscribe(this.currentChannelName);
            this.currentChannel = null;
            this.currentChannelName = null;
            this.globalCallback = null;
            this.eventHandlersMap.clear();
            this.onError = undefined;
        }
    }

    /**
     * Disconnect and cleanup
     * Should be called on widget unmount
     */
    destroy(): void {
        this.unsubscribe();
        this.pusher.connection.unbind();
        this.pusher.disconnect();
    }

    private handleConnectionError = (error: unknown): void => {
        console.error("[PusherListener] Connection error:", error);
    };

    private handleStateChange = (states: { previous: string; current: string }): void => {
        console.debug(`[PusherListener] State changed: ${states.previous} → ${states.current}`);
    };
}
