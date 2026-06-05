import Pusher, { Channel } from "pusher-js";

export interface PusherConfig {
    key: string;
    cluster: string;
    authEndpoint: string;
    csrfToken: string;
}

export interface SubscriptionConfig {
    channelName: string;
    eventName: string;
    onEvent: (data: unknown) => void;
    onError?: (error: Error) => void;
}

export class PusherListener {
    private pusher: Pusher;
    private currentChannel: Channel | null = null;
    private currentSubscription: SubscriptionConfig | null = null;

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
     * Subscribe to channel for specific object and event
     * Automatically unsubscribes from previous channel if different
     */
    subscribe(config: SubscriptionConfig): void {
        // If already subscribed to same channel and event, do nothing
        if (config === this.currentSubscription) {
            return;
        }

        // Unsubscribe from previous channel if exists
        this.unsubscribe();

        // Subscribe to new channel
        this.currentSubscription = config;
        this.currentChannel = this.pusher.subscribe(config.channelName);

        // Bind event handler
        this.currentChannel.bind(config.eventName, config.onEvent);

        // Bind error handler
        this.currentChannel.bind("pusher:subscription_error", (error: unknown) => {
            console.error(error);
            const errorMsg =
                error === 515
                    ? "Authentication failed. Please verify Pusher configuration constants."
                    : `Subscription error: ${String(error)}`;
            config.onError?.(new Error(errorMsg));
        });
    }

    /**
     * Unsubscribe from current channel
     */
    unsubscribe(): void {
        if (this.currentChannel && this.currentSubscription) {
            // Unbind all channel events
            this.currentChannel.unbind();
            this.pusher.unsubscribe(this.currentSubscription.channelName);
            this.currentChannel = null;
            this.currentSubscription = null;
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
