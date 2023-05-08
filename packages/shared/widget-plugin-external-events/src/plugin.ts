import EventEmitter from "events";

type Unsubscribe = () => void;
type Listener = (...args: any[]) => void;

const defaultMaxListeners = 32;
const pluginVersion = "0.1.0";
const pluginPathExternalEvents = "com.mendix.widgets.web.plugin.externalEvents" as const;

export interface PluginExternalEvents {
    version: string;
    emit(channelName: string, eventName: string, ...args: any[]): void;
    subscribe(channelName: string, eventName: string, callback: Listener): Unsubscribe;
    unsubscribe(channelName: string, eventName: string, callback: Listener): void;
}

class ExternalEvents implements PluginExternalEvents {
    version = pluginVersion;
    private channels: Map<string, EventEmitter>;

    constructor() {
        this.channels = new Map<string, EventEmitter>();
    }

    private getChannel(name: string): EventEmitter | undefined {
        return this.channels.get(name);
    }

    private disposeChannel(name: string): boolean {
        const emitterToRemove = this.channels.get(name);

        if (emitterToRemove) {
            emitterToRemove.removeAllListeners();
        }

        return this.channels.delete(name);
    }

    private getSubscribeChannel(name: string): EventEmitter {
        let emitter = this.channels.get(name);

        if (emitter === undefined) {
            emitter = new EventEmitter();
            emitter.setMaxListeners(defaultMaxListeners);
            this.channels.set(name, emitter);
        }

        return emitter;
    }

    emit(channelName: string, eventName: string, ...args: any[]): void {
        this.getChannel(channelName)?.emit(eventName, ...args);
    }

    subscribe(channelName: string, eventName: string, listener: Listener): Unsubscribe {
        this.getSubscribeChannel(channelName).addListener(eventName, listener);
        return () => this.unsubscribe(channelName, eventName, listener);
    }

    unsubscribe(channelName: string, eventName: string, listener: Listener): void {
        const channel = this.getChannel(channelName);
        if (channel) {
            channel.removeListener(eventName, listener);
            const listenersTotal = channel.eventNames().reduce((acc, evt) => acc + channel.listenerCount(evt), 0);

            if (listenersTotal === 0) {
                this.disposeChannel(channelName);
            }
        }
    }
}

declare global {
    interface Window {
        [pluginPathExternalEvents]?: PluginExternalEvents;
    }
}

function pluginSetup(): PluginExternalEvents {
    if (Object.prototype.hasOwnProperty.call(window, pluginPathExternalEvents)) {
        throw new Error("Widget plugin external events: plugin already initialized!");
    }

    return new ExternalEvents();
}

function requirePlugin(): PluginExternalEvents {
    let plugin = window[pluginPathExternalEvents];
    if (plugin === undefined) {
        plugin = window[pluginPathExternalEvents] = pluginSetup();
    }

    return plugin;
}

export { requirePlugin };
