import { ElementProps, FloatingRootContext } from "@floating-ui/react";
import { KeyboardEvent, MouseEvent, useMemo, useRef } from "react";

// Elements that a user activates with Enter or Space. Text inputs and other typeable elements are left out on purpose.
const ACTIVATABLE_SELECTOR = [
    "button",
    "a[href]",
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    '[role="button"]',
    '[role="link"]'
].join(",");

// Form controls that a user types in or changes. A click on them opens the tooltip but never closes it,
// so moving the cursor in a text box or ticking a check box doesn't hide it.
const FORM_CONTROL_SELECTOR = "input, textarea, select, label";

function isActivatable(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && !target.isContentEditable && target.matches(ACTIVATABLE_SELECTOR);
}

function isFormControl(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        !isActivatable(target) &&
        (target.isContentEditable || target.closest(FORM_CONTROL_SELECTOR) !== null)
    );
}

/**
 * True when the event comes from this tooltip's own trigger, not from a tooltip nested inside it.
 * Without this check, Enter on a nested trigger toggles the outer tooltip too.
 */
function isOwnEvent(event: KeyboardEvent<Element> | MouseEvent<Element>): boolean {
    const target = event.target;
    if (!(target instanceof Element)) {
        return false;
    }
    return target.closest(".widget-tooltip") === event.currentTarget.closest(".widget-tooltip");
}

interface UseKeyboardClickProps {
    enabled: boolean;
}

/**
 * Toggles the tooltip on click, Enter and Space.
 *
 * Floating UI's `useClick` relies on the browser dispatching a native `click` when Enter or Space is
 * pressed on a button. Some trigger widgets, like the Mendix action button, handle those keys
 * themselves and dispatch no `click`, so the tooltip never opened from the keyboard.
 * This hook toggles on the key itself and skips the native `click` that may follow it.
 *
 * The handlers run in the capture phase: a Mendix action button with an action stops propagation
 * of `click` and `keydown`, so bubble-phase handlers on the wrapper never see them. The handlers
 * never stop propagation or prevent default, so the trigger's own action still runs.
 */
export function useKeyboardClick(
    context: Pick<FloatingRootContext, "open" | "onOpenChange">,
    { enabled }: UseKeyboardClickProps
): ElementProps {
    const { open, onOpenChange } = context;
    // Set when a key press toggled the tooltip, so the native click of the same activation is skipped
    const keyToggledRef = useRef(false);
    const spaceDownRef = useRef(false);

    const reference = useMemo<ElementProps["reference"]>(() => {
        const toggle = (event: KeyboardEvent<Element> | MouseEvent<Element>): void => {
            onOpenChange(!open, event.nativeEvent, "click");
        };
        const openOnly = (event: MouseEvent<Element>): void => {
            if (!open) {
                onOpenChange(true, event.nativeEvent, "click");
            }
        };

        return {
            onKeyDownCapture(event: KeyboardEvent<Element>) {
                keyToggledRef.current = false;
                if (!isOwnEvent(event) || !isActivatable(event.target)) {
                    return;
                }
                if (event.repeat) {
                    // Holding a key sends repeated keydowns. Toggle once per press and skip the native
                    // click a repeated Enter dispatches on a button.
                    keyToggledRef.current = event.key === "Enter";
                    return;
                }
                if (event.key === "Enter") {
                    keyToggledRef.current = true;
                    toggle(event);
                } else if (event.key === " ") {
                    spaceDownRef.current = true;
                }
            },
            onKeyUpCapture(event: KeyboardEvent<Element>) {
                if (event.key !== " " || !spaceDownRef.current || !isOwnEvent(event)) {
                    return;
                }
                spaceDownRef.current = false;
                if (isActivatable(event.target)) {
                    keyToggledRef.current = true;
                    toggle(event);
                }
            },
            onPointerDownCapture() {
                keyToggledRef.current = false;
                spaceDownRef.current = false;
            },
            onBlur() {
                keyToggledRef.current = false;
                spaceDownRef.current = false;
            },
            onClickCapture(event: MouseEvent<Element>) {
                if (keyToggledRef.current) {
                    keyToggledRef.current = false;
                    return;
                }
                if (!isOwnEvent(event)) {
                    return;
                }
                if (isFormControl(event.target)) {
                    openOnly(event);
                    return;
                }
                toggle(event);
            }
        };
    }, [open, onOpenChange]);

    return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
