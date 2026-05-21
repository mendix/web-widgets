import Pusher, { Channel } from "pusher-js";

export interface PusherConfig {
    key: string;
    cluster: string;
    authEndpoint: string;
    csrfToken: string;
}

export interface SubscriptionConfig {
    entityName: string;
    guid: string;
    eventName: string;
    onEvent: (data: unknown) => void;
    onError?: (error: Error) => void;
}

export class PusherListener {
    private pusher: Pusher | null = null;
    private currentChannel: Channel | null = null;
    private currentChannelName: string | null = null;
    private currentEventName: string | null = null;

    constructor(private config: PusherConfig) {}

    /**
     * Initialize Pusher connection
     * Should be called once on widget mount
     */
    async initialize(): Promise<void> {
        if (this.pusher) {
            return; // Already initialized
        }

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
        if (!this.pusher) {
            throw new Error("PusherListener not initialized. Call initialize() first.");
        }

        const channelName = this.buildChannelName(config.entityName, config.guid);

        // If already subscribed to same channel and event, do nothing
        if (channelName === this.currentChannelName && config.eventName === this.currentEventName) {
            return;
        }

        // Unsubscribe from previous channel if exists
        this.unsubscribe();

        // Subscribe to new channel
        this.currentChannelName = channelName;
        this.currentEventName = config.eventName;
        this.currentChannel = this.pusher.subscribe(channelName);

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
        if (this.currentChannel && this.currentChannelName) {
            // Unbind event handler before unsubscribing
            if (this.currentEventName) {
                this.currentChannel.unbind(this.currentEventName);
            }
            this.pusher?.unsubscribe(this.currentChannelName);
            this.currentChannel = null;
            this.currentChannelName = null;
            this.currentEventName = null;
        }
    }

    /**
     * Disconnect and cleanup
     * Should be called on widget unmount
     */
    destroy(): void {
        this.unsubscribe();
        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
        }
    }

    private buildChannelName(entityName: string, guid: string): string {
        return `private-${entityName}.${guid}`;
    }

    private handleConnectionError = (error: unknown): void => {
        console.error("[PusherListener] Connection error:", error);
    };

    private handleStateChange = (states: { previous: string; current: string }): void => {
        console.debug(`[PusherListener] State changed: ${states.previous} → ${states.current}`);
    };
}
