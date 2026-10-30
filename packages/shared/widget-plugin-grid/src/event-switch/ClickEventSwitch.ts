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
        let previous: { detail: number; timeStamp: number } | undefined;

        return {
            eventName: "onClick",
            handler: (ctx, event) => {
                const isSameGesture =
                    previous !== undefined &&
                    previous.detail === event.detail &&
                    event.timeStamp - previous.timeStamp < sameGestureWindow;

                if (isSameGesture) {
                    return;
                }

                previous = { detail: event.detail, timeStamp: event.timeStamp };

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
