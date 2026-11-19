import { MouseEvent } from "react";
import { EventCaseEntry } from "./base";
import { groupEntries } from "./utils";

export type ClickEntry<Context, Element> =
    EventCaseEntry<Context, Element, "onClick"> | EventCaseEntry<Context, Element, "onDoubleClick">;

export class ClickEventSwitch<Context, Element> {
    constructor(private entries: Array<ClickEntry<Context, Element>>) {}

    getClickEntry(): EventCaseEntry<Context, Element, "onClick"> {
        const { onClick = [], onDoubleClick = [] } = groupEntries(this.entries);
        const awaitTime = 320; // ms, approx 1/3 of a second
        const sameGestureWindow = 5; // ms
        let startTime = -Infinity;
        let previous: { detail: number; timeStamp: number; forwardsTo: EventTarget | null } | undefined;

        return {
            eventName: "onClick",
            handler: (ctx, event) => {
                const isSameGesture =
                    previous !== undefined &&
                    previous.detail === event.detail &&
                    ((previous.forwardsTo !== null && previous.forwardsTo === event.target) ||
                        event.timeStamp - previous.timeStamp < sameGestureWindow);

                if (isSameGesture) {
                    return;
                }

                previous = {
                    detail: event.detail,
                    timeStamp: event.timeStamp,
                    forwardsTo: forwardedControl(event.target)
                };

                if (event.timeStamp - startTime > awaitTime) {
                    onClick.forEach(entry => this.runEntry(entry, ctx, event));
                    startTime = event.timeStamp;
                } else {
                    onDoubleClick.forEach(entry => this.runEntry(entry, ctx, event));
                    startTime = -Infinity;
                }
            }
        };
    }

    private runEntry(entry: ClickEntry<Context, Element>, ctx: Context, event: MouseEvent<Element>): void {
        const canRun = entry.filter?.(ctx, event) ?? true;
        if (canRun) {
            entry.handler(ctx, event);
        }
    }
}

// The browser re-dispatches a click on a <label> to its control. Event timestamps can't tell the two
// apart reliably (jsdom rounds them to whole ms, a busy main thread delays the second one), the target can.
function forwardedControl(target: EventTarget | null): Element | null {
    if (typeof (target as Element | null)?.closest !== "function") {
        return null;
    }
    const element = target as Element;
    const control = element.closest("label")?.control ?? null;
    return control && !control.contains(element) ? control : null;
}
