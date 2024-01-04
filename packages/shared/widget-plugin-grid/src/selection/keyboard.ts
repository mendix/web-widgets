import { EventCaseEntry } from "../event-switch/base";

export function isSelectAllTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "KeyA" && (event.metaKey || event.ctrlKey);
}

export function isSelectOneTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.shiftKey;
}

export const preventScrollOnSpace = (): EventCaseEntry<unknown, Element, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (_, event) => event.code === "Space" && event.target === event.currentTarget,
    handler: (_, event) => {
        event.stopPropagation();
        event.preventDefault();
    }
});
