import { ElementEntry, EventCaseEntry } from "@mendix/widget-plugin-grid/event-switch/base";
import { FocusTargetFx } from "@mendix/widget-plugin-grid/keyboard-navigation/base";

const onClick = (focusTargetFx: FocusTargetFx): EventCaseEntry<unknown, Element, "onClick"> => ({
    eventName: "onClick",
    handler: (_, event) => focusTargetFx({ type: "Mouse", reactEvent: event })
});

const onKeyDown = (focusTargetFx: FocusTargetFx): EventCaseEntry<unknown, Element, "onKeyDown"> => ({
    eventName: "onKeyDown",
    handler: (_, event) => focusTargetFx({ type: "Keyboard", reactEvent: event })
});

const onFocus = (focusTargetFx: FocusTargetFx): EventCaseEntry<unknown, Element, "onFocus"> => ({
    eventName: "onFocus",
    handler: (_, event) => focusTargetFx({ type: "Focus", reactEvent: event })
});

export function createFocusTargetHandlers(focusTargetFx: FocusTargetFx): Array<ElementEntry<unknown, Element>> {
    return [onClick(focusTargetFx), onKeyDown(focusTargetFx), onFocus(focusTargetFx)];
}
