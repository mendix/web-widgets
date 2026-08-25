import { MouseEvent } from "react";
import { EventCaseEntry } from "./base";
import { groupEntries } from "./utils";

export type ClickEntry<Context, Element> =
    EventCaseEntry<Context, Element, "onClick"> | EventCaseEntry<Context, Element, "onDoubleClick">;

export class ClickEventSwitch<Context, Element> {
    constructor(private entries: Array<ClickEntry<Context, Element>>) {}

    getClickEntry(): EventCaseEntry<Context, Element, "onClick"> {
        const { onClick = [], onDoubleClick = [] } = groupEntries(this.entries);
        // One gesture can produce more than one click event on the same element:
        // clicking a <label> makes the browser forward a click to the labelled
        // control, and that click bubbles back to us with the same click count and
        // (almost) the same timestamp.
        const sameGestureWindow = 5; // ms
        let previous: { detail: number; timeStamp: number } | undefined;

        return {
            eventName: "onClick",
            handler: (ctx, event) => {
                // The click count is 0 when the click was not made with a pointer,
                // e.g. keyboard activation or element.click(). Keys have their own
                // entries, so there is nothing to do here.
                if (event.detail === 0) {
                    return;
                }

                const isSameGesture =
                    previous !== undefined &&
                    previous.detail === event.detail &&
                    event.timeStamp - previous.timeStamp < sameGestureWindow;

                if (isSameGesture) {
                    return;
                }

                previous = { detail: event.detail, timeStamp: event.timeStamp };

                if (event.detail === 1) {
                    onClick.forEach(entry => this.runEntry(entry, ctx, event));
                } else if (event.detail === 2) {
                    onDoubleClick.forEach(entry => this.runEntry(entry, ctx, event));
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
