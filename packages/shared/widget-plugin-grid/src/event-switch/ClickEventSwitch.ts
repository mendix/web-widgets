import { EventCaseEntry } from "./base";
import { groupEntries } from "./utils";

export type ClickEntry<Context, Element> =
    | EventCaseEntry<Context, Element, "onClick">
    | EventCaseEntry<Context, Element, "onDoubleClick">;

export class ClickEventSwitch<Context, Element> {
    constructor(private entries: Array<ClickEntry<Context, Element>>) {}

    getClickEntry(): EventCaseEntry<Context, Element, "onClick"> {
        const { onClick = [], onDoubleClick = [] } = groupEntries(this.entries);
        const awaitTime = 320; // ms, approx 1/3 of a second
        let startTime = 0;
        return {
            eventName: "onClick",
            handler: (ctx, event) => {
                if (Date.now() - startTime > awaitTime) {
                    onClick.forEach(entry => this.runEntry(entry, ctx, event));
                    startTime = Date.now();
                } else {
                    onDoubleClick.forEach(entry => this.runEntry(entry, ctx, event));
                    startTime = 0;
                }
            }
        };
    }

    private runEntry(entry: ClickEntry<Context, Element>, ctx: Context, event: React.MouseEvent<Element>): void {
        const canRun = entry.filter?.(ctx, event) ?? true;
        if (canRun) {
            entry.handler(ctx, event);
        }
    }
}
