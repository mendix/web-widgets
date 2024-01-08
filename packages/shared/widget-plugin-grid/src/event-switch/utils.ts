import { ElementEntry, EntriesByEvent } from "./base";

export function groupEntries<Context, Element>(
    cases: Array<ElementEntry<Context, Element>>
): EntriesByEvent<Context, Element> {
    const grouped: EntriesByEvent<Context, Element> = {};

    return cases.reduce((acc, entry) => {
        switch (entry.eventName) {
            case "onClick":
                acc.onClick = acc.onClick ?? [];
                acc.onClick.push(entry);
                break;
            case "onDoubleClick":
                acc.onDoubleClick = acc.onDoubleClick ?? [];
                acc.onDoubleClick.push(entry);
                break;
            case "onKeyDown":
                acc.onKeyDown = acc.onKeyDown ?? [];
                acc.onKeyDown.push(entry);
                break;
            case "onKeyUp":
                acc.onKeyUp = acc.onKeyUp ?? [];
                acc.onKeyUp.push(entry);
                break;
            case "onMouseDown":
                acc.onMouseDown = acc.onMouseDown ?? [];
                acc.onMouseDown.push(entry);
                break;
            case "onFocus":
                acc.onFocus = acc.onFocus ?? [];
                acc.onFocus.push(entry);
                break;
        }
        return acc;
    }, grouped);
}
