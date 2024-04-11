import { ObjectItem } from "mendix";
import { throttle } from "@mendix/widget-plugin-platform/utils/throttle";
import { EventCaseEntry } from "../event-switch/base";
import { ScrollKeyCode, SelectAdjacentFx, SelectionMode, SelectionType } from "./types";

export function isSelectAllTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    // As there might be custom content. We should react only on item/cell events.
    const isOwn = event.currentTarget === event.target;
    return event.code === "KeyA" && (event.metaKey || event.ctrlKey) && isOwn;
}

export function isSelectOneTrigger<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.shiftKey;
}

export function isOwnSpaceKey<T>(event: React.KeyboardEvent<T>): boolean {
    return event.code === "Space" && event.target === event.currentTarget;
}

export const onOwnSpaceKeyDown = (
    handler: (event: React.KeyboardEvent<Element>) => void
): EventCaseEntry<unknown, Element, "onKeyDown"> => ({
    eventName: "onKeyDown",
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

interface SelectAdjacentContext<T> {
    item: T;
    selectionType: SelectionType;
    selectionMode: SelectionMode;
}

interface DGSelectContext<T> extends SelectAdjacentContext<T> {
    pageSize: number;
}

type NavKeyEntry = EventCaseEntry<SelectAdjacentContext<ObjectItem>, Element, "onKeyDown">;
type DatagridNavKeyEntry = EventCaseEntry<DGSelectContext<ObjectItem>, Element, "onKeyDown">;

function getAdjacentFxMode(context: SelectAdjacentContext<any>, event: React.KeyboardEvent): SelectionMode {
    if (event.metaKey || event.ctrlKey) {
        return "toggle";
    }
    return context.selectionMode;
}

export const onSelectAdjacentHotKey = (selectAdjacentFx: SelectAdjacentFx): DatagridNavKeyEntry[] => {
    const onArrowUp: DatagridNavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "ArrowUp" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "backward",
                size: 1
            })
    };

    const onArrowDown: DatagridNavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "ArrowDown" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "forward",
                size: 1
            })
    };

    const onPageUp: DatagridNavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "PageUp" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "backward",
                size: ctx.pageSize
            })
    };

    const onPageDown: DatagridNavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "PageDown" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "forward",
                size: ctx.pageSize
            })
    };

    const onHome: DatagridNavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "Home" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "backward",
                size: "edge"
            })
    };

    const onEnd: DatagridNavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "End" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "forward",
                size: "edge"
            })
    };

    return [onArrowUp, onArrowDown, onPageUp, onPageDown, onHome, onEnd];
};

// Created the onSelectGridAdjacentHotKey to handle Gallery keyboard navigation that is displayed as a 2D grid
export const onSelectGridAdjacentHotKey = (
    selectAdjacentFx: SelectAdjacentFx,
    numberOfColumns: number
): NavKeyEntry[] => {
    const onArrowUp: NavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "ArrowUp" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "backward",
                size: numberOfColumns
            })
    };

    const onArrowDown: NavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "ArrowDown" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "forward",
                size: numberOfColumns
            })
    };

    const onArrowLeft: NavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "ArrowLeft" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "backward",
                size: 1
            })
    };

    const onArrowRight: NavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => event.code === "ArrowRight" && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                direction: "forward",
                size: 1
            })
    };

    const scrollKeys = new Set(["PageUp", "PageDown", "Home", "End"]);
    const onScrollKey: NavKeyEntry = {
        eventName: "onKeyDown",
        filter: (ctx, event) => scrollKeys.has(event.code) && ctx.selectionType === "Multi",
        handler: (ctx, event) =>
            selectAdjacentFx(ctx.item, event.shiftKey, getAdjacentFxMode(ctx, event), {
                code: event.code as ScrollKeyCode,
                numberOfColumns
            })
    };

    return [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onScrollKey];
};
