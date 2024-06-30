import { EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";

/** An entry that adds a filter that ignores events from the input/textarea. */
export function withInputEventsFilter<Context>(
    entries: Array<EventCaseEntry<Context, Element, "onKeyDown">>
): EventCaseEntry<Context, Element, "onKeyDown"> {
    return {
        eventName: "onKeyDown",
        filter: (_ctx, event) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return false;
            }
            return true;
        },
        handler: (ctx, event) => {
            for (const entry of entries) {
                if (entry.filter?.(ctx, event) ?? true) {
                    entry.handler(ctx, event);
                }
            }
        }
    };
}
