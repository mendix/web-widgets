import {
    FloatingFocusManager,
    FloatingOverlay,
    FloatingPortal,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    useRole
} from "@floating-ui/react";
import classNames from "classnames";
import { ReactElement, ReactNode, Ref, useEffect, useRef } from "react";
import { DialogStyleEnum } from "../../../../typings/RichTextProps";
import { useDropdown } from "../hooks/useDropdown";
import "./Dialog.scss";

export interface DialogShellProps {
    /**
     * `inline` anchors the dialog to `referenceElement`; `focused` centers it over a dimmed,
     * scroll-locked overlay with a focus trap.
     */
    mode: DialogStyleEnum;
    onClose: () => void;
    /** Anchor for `inline` mode. Unused in `focused` mode. */
    referenceElement?: HTMLElement | null;
    /** Dialog-specific class, e.g. `image-dialog`, applied next to `toolbar-dialog`. */
    className?: string;
    /** Id of the element labelling the dialog. */
    ariaLabelledBy?: string;
    /**
     * Ref onto the `.toolbar-dialog` element. `ImageDialog` needs it: app-developer JS actions
     * dispatch the `imageSelected` custom event at that element, so it must stay the same node.
     */
    dialogRef?: Ref<HTMLDivElement>;
    children: ReactNode;
}

/**
 * Bound for `focused` mode, and the inline fallback until the measured available height arrives (or
 * for good, if there is no anchor to measure against). Matches v4's `--max-dialog-height` default.
 */
const DEFAULT_MAX_HEIGHT = "70vh";

/**
 * Shared shell for every Rich Text dialog.
 *
 * Both modes portal to the document body. Rendering in place is what allowed a tall dialog to be
 * clipped: the widget node sets `overflow: hidden`, and any ancestor with a transform — a Mendix
 * popup page, for one — turns it into the containing block for `position: fixed`, so the dialog
 * could no longer escape it. Both modes also bound their own height and expect the caller to mark
 * the region that should scroll (`.dialog-scroll`), which keeps `.dialog-actions` reachable.
 */
export function DialogShell({
    mode,
    onClose,
    referenceElement,
    className,
    ariaLabelledBy,
    dialogRef,
    children
}: DialogShellProps): ReactElement {
    const isInline = mode === "inline";

    // Inline positioning. `trackAvailableHeight` reports the room left at the resolved placement so
    // the dialog shrinks to fit instead of overflowing the viewport.
    const {
        refs: inlineRefs,
        floatingStyles,
        availableHeight
    } = useDropdown({
        isOpen: isInline,
        onClose,
        referenceElement,
        trackAvailableHeight: true
    });

    // Focused mode interactions. Hooks run in both modes — React requires an unconditional call —
    // but stay inert while `open` is false.
    const { refs: focusedRefs, context } = useFloating({
        open: !isInline,
        onOpenChange: open => {
            if (!open) {
                onClose();
            }
        }
    });
    // Escape is handled below in the capture phase, so `useDismiss` must not also claim it.
    const dismiss = useDismiss(context, { outsidePressEvent: "mousedown", escapeKey: false });
    const role = useRole(context, { role: "dialog" });
    const { getFloatingProps } = useInteractions([dismiss, role]);

    // Focus target when the dialog itself opens with nothing already focused inside it. A dialog
    // whose first field carries `autoFocus` keeps that focus: FloatingFocusManager leaves focus
    // alone when it is already inside the floating element.
    const focusTargetRef = useRef<HTMLDivElement>(null);
    const focusedDialogRef = useMergeRefs([focusedRefs.setFloating, focusTargetRef, dialogRef ?? null]);

    // Escape closes the dialog, and stops there. Without the capture phase and `stopPropagation`,
    // an Escape meant for the dialog also reaches the editor, whose Fullscreen extension exits
    // fullscreen on Escape — closing the dialog and leaving fullscreen in one keystroke.
    useEffect(() => {
        if (isInline) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            onClose();
        };

        document.addEventListener("keydown", handleKeyDown, true);
        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [isInline, onClose]);

    const dialogClassName = classNames("toolbar-dialog", className);

    if (isInline) {
        return (
            <FloatingPortal>
                {/* `widget-rich-text` travels with the portalled node so widget-scoped styling and
                    custom properties still resolve outside the widget's own subtree. */}
                <div
                    ref={inlineRefs.setFloating}
                    style={floatingStyles}
                    className="widget-rich-text widget-rich-text-dialog-layer"
                >
                    <div
                        ref={dialogRef}
                        className={dialogClassName}
                        style={{ maxHeight: availableHeight ?? DEFAULT_MAX_HEIGHT }}
                    >
                        {children}
                    </div>
                </div>
            </FloatingPortal>
        );
    }

    return (
        <FloatingPortal>
            <FloatingOverlay lockScroll className="widget-rich-text widget-rich-text-dialog-overlay">
                <FloatingFocusManager context={context} initialFocus={focusTargetRef}>
                    <div
                        ref={focusedDialogRef}
                        {...getFloatingProps()}
                        className={dialogClassName}
                        style={{ maxHeight: DEFAULT_MAX_HEIGHT }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={ariaLabelledBy}
                        // Fallback focus target: a dialog whose content has no tabbable element
                        // still has to receive focus for the trap to hold.
                        tabIndex={-1}
                    >
                        {children}
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
}
