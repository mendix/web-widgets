import { useMemo, useRef, useEffect } from "react";
import { DOMElement, ElementEntries } from "./base";
import { groupEntries } from "./utils";

export function useEventSwitch<Context, Element>(
    contextFn: () => Context,
    cases: () => Array<ElementEntries<Context, Element>>
): DOMElement<Element> {
    const contextRef = useRef(contextFn);

    useEffect(() => {
        contextRef.current = contextFn;
    });

    return useMemo(() => {
        return eventSwitch(() => contextRef.current(), cases());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

function eventSwitch<Context, Element>(
    contextFn: () => Context,
    cases: Array<ElementEntries<Context, Element>>
): DOMElement<Element> {
    const grouped = groupEntries(cases);
    return {
        onClick(event) {
            grouped.onClick?.forEach(entry => {
                const ctx = contextFn();
                const canRun = entry.filter ? entry.filter(ctx, event) : true;
                if (canRun) {
                    entry.handler(ctx, event);
                }
            });
        }
    };
}
