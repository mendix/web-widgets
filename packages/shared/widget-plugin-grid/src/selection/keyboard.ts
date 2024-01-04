import { throttle } from "@mendix/widget-plugin-platform/utils/throttle";
import { EventCaseEntry } from "../event-switch/base";
import { SelectionType } from "./types";

export function isSelectAllTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "KeyA" && (event.metaKey || event.ctrlKey);
}

export function isSelectOneTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.shiftKey;
}

export function isOwnSpaceKey<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.target === event.currentTarget;
}

export const onOwnSpaceKeyUp = (
    handler: (event: React.KeyboardEvent<Element>) => void
): EventCaseEntry<unknown, Element, "onKeyUp"> => ({
    eventName: "onKeyUp",
    filter: (_, event) => isOwnSpaceKey(event),
    handler: (_, event) => handler(event)
});

const selectAllStopKey = new Set(["KeyA", "MetaLeft", "MetaRight", "ControlLeft", "ControlRight"]);

interface SelectAllContext {
    selectionType: SelectionType;
}

export const onSelectAllHotKey = (
    onStart: () => void,
    onEnd?: () => void
): [EventCaseEntry<SelectAllContext, Element, "onKeyDown">, EventCaseEntry<SelectAllContext, Element, "onKeyUp">] => {
    let pressed = false;

    const [onPressStart, stopThrottle] = throttle((): void => {
        pressed = true;
        onStart();
    }, 500);

    const onPressEnd = (): void => {
        pressed = false;
        stopThrottle();
        onEnd?.();
    };

    const onKeyDown: EventCaseEntry<SelectAllContext, Element, "onKeyDown"> = {
        eventName: "onKeyDown",
        filter: (ctx, event) => {
            return ctx.selectionType === "Multi" && isSelectAllTrigger(event);
        },
        handler: onPressStart
    };

    const onKeyUp: EventCaseEntry<SelectAllContext, Element, "onKeyUp"> = {
        eventName: "onKeyUp",
        filter: (ctx, event) => ctx.selectionType === "Multi" && selectAllStopKey.has(event.code) && pressed,
        handler: onPressEnd
    };

    return [onKeyDown, onKeyUp];
};
