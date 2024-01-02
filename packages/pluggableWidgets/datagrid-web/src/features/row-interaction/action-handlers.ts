import { EventCaseEntry } from "./base";

type onExecuteAction = (item: unknown) => void;

const onClick = (fn: onExecuteAction): EventCaseEntry<"div", unknown, "onClick"> => ({
    eventName: "onClick",
    handler: () => fn({})
});

const onKeyUp = (fn: onExecuteAction): EventCaseEntry<"div", unknown, "onKeyUp"> => ({
    eventName: "onKeyUp",
    handler: () => fn({})
});

export function createActionHandlers(fn: onExecuteAction): Array<EventCaseEntry<"div", unknown>> {
    return [onClick(fn), onKeyUp(fn)];
}
