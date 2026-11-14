import { useLayoutEffect } from "react";

export const POPUP_ARIA_ATTRIBUTES = ["aria-haspopup", "aria-expanded", "aria-controls"] as const;

export type PopupAria = Partial<Record<(typeof POPUP_ARIA_ATTRIBUTES)[number], string>>;

/** Elements that can carry the menu button state. Text boxes can't: aria-expanded needs role combobox there. */
const BUTTON_LIKE = 'button, a[href], [role="button"]';

/**
 * Puts the menu button state (aria-haspopup, aria-expanded, aria-controls) on the button inside the trigger.
 *
 * The trigger content is a Mendix widget (usually an Action Button) that takes no props from us, so the
 * attributes can't be passed to it through React. Left on the trigger wrapper, which has no role and never
 * gets focus, screen readers don't announce them. They are set on the first button-like element inside the
 * wrapper instead, and re-applied when the Mendix client replaces the content. Without such an element
 * (e.g. a text box trigger) they stay on the wrapper.
 *
 * Pass `null` to set nothing (a nested menu: its parent menu item carries the state).
 */
export function useTriggerAria(wrapper: HTMLElement | null, aria: PopupAria | null): void {
    const hasPopup = aria?.["aria-haspopup"];
    const expanded = aria?.["aria-expanded"];
    const controls = aria?.["aria-controls"];

    useLayoutEffect(() => {
        if (!wrapper || !aria) {
            return;
        }
        const values: PopupAria = { "aria-haspopup": hasPopup, "aria-expanded": expanded, "aria-controls": controls };
        let target: HTMLElement | null = null;

        const apply = (): void => {
            const next = wrapper.querySelector<HTMLElement>(BUTTON_LIKE) ?? wrapper;
            if (target && target !== next) {
                removeAria(target);
            }
            target = next;
            setAria(target, values);
        };

        apply();
        // React doesn't touch attributes it doesn't render, so they survive re-renders of the content,
        // but not the content being replaced (e.g. conditional visibility in the trigger).
        const observer = new MutationObserver(apply);
        observer.observe(wrapper, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            if (target) {
                removeAria(target);
            }
        };
        // `aria` is a fresh object every render; its values are the dependencies.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wrapper, aria === null, hasPopup, expanded, controls]);
}

function setAria(element: HTMLElement, values: PopupAria): void {
    for (const name of POPUP_ARIA_ATTRIBUTES) {
        const value = values[name];
        if (value === undefined) {
            element.removeAttribute(name);
        } else if (element.getAttribute(name) !== value) {
            element.setAttribute(name, value);
        }
    }
}

function removeAria(element: HTMLElement): void {
    for (const name of POPUP_ARIA_ATTRIBUTES) {
        element.removeAttribute(name);
    }
}
