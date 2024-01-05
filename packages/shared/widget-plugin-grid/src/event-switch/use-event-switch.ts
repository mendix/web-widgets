import { useMemo, useRef, useEffect } from "react";
import { ElementProps, ElementEntries, EventCaseEntry, InferEvent } from "./base";
import { groupEntries } from "./utils";

export function useEventSwitch<Context, Element>(
    contextFn: () => Context,
    cases: () => Array<ElementEntries<Context, Element>>
): ElementProps<Element> {
    const contextRef = useRef(contextFn);

    useEffect(() => {
        contextRef.current = contextFn;
    });

    return useMemo(() => {
        return eventSwitch(() => contextRef.current(), cases());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export function eventSwitch<Context, Element>(
    contextFn: () => Context,
    cases: Array<ElementEntries<Context, Element>>
): ElementProps<Element> {
    const grouped = groupEntries(cases);
    return {
        onClick(event) {
            grouped.onClick?.forEach(entry => exec(contextFn, event, entry));
        },
        onDoubleClick(event) {
            grouped.onDoubleClick?.forEach(entry => exec(contextFn, event, entry));
        },
        onKeyUp(event) {
            grouped.onKeyUp?.forEach(entry => exec(contextFn, event, entry));
        },
        onKeyDown(event) {
            grouped.onKeyDown?.forEach(entry => exec(contextFn, event, entry));
        },
        onMouseDown(event) {
            grouped.onMouseDown?.forEach(entry => exec(contextFn, event, entry));
        }
    };
}

function exec<
    Context,
    Element,
    EventName extends keyof ElementProps<Element>,
    E extends InferEvent<ElementProps<Element>[EventName]>
>(contextFn: () => Context, event: E, entry: EventCaseEntry<Context, Element, EventName>): void {
    const ctx = contextFn();
    const canRun = entry.filter ? entry.filter(ctx, event) : true;
    if (canRun) {
        entry.handler(ctx, event);
    }
}
