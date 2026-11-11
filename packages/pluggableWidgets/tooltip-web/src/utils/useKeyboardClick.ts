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

function isActivatable(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && !target.isContentEditable && target.matches(ACTIVATABLE_SELECTOR);
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

        return {
            onKeyDownCapture(event: KeyboardEvent<Element>) {
                keyToggledRef.current = false;
                if (!isActivatable(event.target)) {
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
                if (event.key !== " " || !spaceDownRef.current) {
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
                toggle(event);
            }
        };
    }, [open, onOpenChange]);

    return useMemo(() => (enabled ? { reference } : {}), [enabled, reference]);
}
