import { useFloatingTree, useMergeRefs } from "@floating-ui/react";
import { FocusEvent, forwardRef, KeyboardEvent, PropsWithChildren, ReactElement, RefObject } from "react";
import { useMouseDownRef } from "../hooks/useMouseDownRef";
import { usePopupContext } from "../hooks/usePopupContext";

export const PopupTrigger = forwardRef(
    ({ children }: PropsWithChildren, propRef: RefObject<HTMLDivElement>): ReactElement => {
        const { getReferenceProps, open, refs, isNested, setOpen, keyboardActivationRef } = usePopupContext();
        const childrenRef = (children as any).ref;
        const ref = useMergeRefs([refs.setReference, propRef, childrenRef]);
        const tree = useFloatingTree();
        const [mouseDownRef, onMouseDown] = useMouseDownRef();

        const onFocus = (e: FocusEvent<HTMLDivElement>): void => {
            // Shift+Tab from an item lands back on the trigger, since it directly precedes the menu
            // in the DOM. FloatingFocusManager's closeOnFocusOut doesn't treat that as focus leaving
            // (it deliberately excuses focus returning to its own reference element), so close here.
            // A mouse press on the trigger is left to the click toggle.
            if (open && !mouseDownRef.current && refs.floating.current?.contains(e.relatedTarget)) {
                if (isNested) {
                    // Tab leaves the whole menu hierarchy.
                    tree?.events.emit("close-all");
                } else {
                    setOpen(false);
                }
            }
        };

        const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
            // Trigger content may call preventDefault (Mendix buttons always do), so it isn't checked here.
            if (e.key === "Enter" || e.key === " ") {
                keyboardActivationRef.current = true;
                // The synthetic click follows keydown (Enter) or keyup (Space). Keyup may land in the menu.
                document.addEventListener("keyup", resetKeyboardActivation, { once: true });
                if (e.key === " " && !isButtonOrTypeable(e.target)) {
                    // Prevent page scroll.
                    e.preventDefault();
                }
                setOpen(!open);
            } else if (e.key === "Escape" && open) {
                e.stopPropagation();
                setOpen(false);
            }
        };

        const resetKeyboardActivation = (): void => {
            setTimeout(() => {
                keyboardActivationRef.current = false;
            });
        };

        return (
            <div
                className={"popupmenu-trigger"}
                ref={ref}
                data-state={open ? "open" : "closed"}
                {...getReferenceProps?.({
                    onClick: e => {
                        e.stopPropagation();
                    },
                    onKeyDown,
                    onFocus,
                    onMouseDown,
                    // A nested menu is exposed by the parent menu item, not by its trigger.
                    ...(isNested && { role: undefined })
                })}
            >
                {children}
            </div>
        );
    }
);

function isButtonOrTypeable(target: EventTarget): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    return (
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
    );
}
