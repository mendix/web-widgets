import { createNanoEvents, Emitter, Unsubscribe } from "nanoevents";

const pluginPathExternalEvents = "com.mendix.widgets.web.plugin.externalEvents" as const;

export type Listener = (...args: any[]) => void;
export type Emit = (channelName: string, eventName: string, ...args: any[]) => void;

declare global {
    interface Window {
        [pluginPathExternalEvents]?: PluginExternalEvents;
    }
}

export interface PluginExternalEvents {
    emit: Emit;
    subscribe(channelName: string, eventName: string, callback: Listener): Unsubscribe;
    unsubscribe(channelName: string, eventName: string, callback: Listener): void;
}

class ExternalEvents implements PluginExternalEvents {
    private channels: Map<string, Emitter>;
    readonly id = Math.random().toString().slice(2);

    constructor() {
        this.channels = new Map<string, Emitter>();
    }

    private disposeChannel(channelName: string): boolean {
        const emitter = this.channels.get(channelName);
        if (emitter) {
            emitter.events = {};
        }

        return this.channels.delete(channelName);
    }

    private getChannel(channelName: string): Emitter {
        let emitter = this.channels.get(channelName);

        if (emitter) {
            return emitter;
        }

        emitter = createNanoEvents();
        this.channels.set(channelName, emitter);
        return emitter;
    }

    emit(channelName: string, eventName: string, ...args: any[]): void {
        this.channels.get(channelName)?.emit(eventName, ...args);
    }

    subscribe(channelName: string, eventName: string, listener: Listener): Unsubscribe {
        this.getChannel(channelName).on(eventName, listener);
        return () => this.unsubscribe(channelName, eventName, listener);
    }

    unsubscribe(channelName: string, eventName: string, listener: Listener): void {
        const channel = this.channels.get(channelName);
        if (!channel) {
            return;
        }

        const listeners = channel.events[eventName];
        if (listeners) {
            channel.events[eventName] = listeners.filter(fn => fn !== listener);
        }
        const listenersTotal = Object.values(channel.events)
            .flat()
            .reduce((acc, fn) => (fn ? acc + 1 : acc), 0);

        if (listenersTotal === 0) {
            this.disposeChannel(channelName);
        }
    }
}

function pluginSetup(): PluginExternalEvents {
    if (Object.prototype.hasOwnProperty.call(window, pluginPathExternalEvents)) {
        throw new Error("Widget plugin external events: plugin already initialized!");
    }

    return new ExternalEvents();
}

function requirePlugin(): PluginExternalEvents {
    return (window[pluginPathExternalEvents] ??= pluginSetup());
}

function deletePlugin(): void {
    delete window[pluginPathExternalEvents];
}

export { requirePlugin, deletePlugin };
