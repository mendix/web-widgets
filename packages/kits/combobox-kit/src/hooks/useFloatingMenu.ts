import { autoUpdate, flip, offset, size, useFloating } from "@floating-ui/react";
import { useMemo } from "react";

// Menu can grow to at most this height; floating-ui shrinks it further when the
// available viewport space is smaller. Mirrors the previous SCSS cap.
const MAX_MENU_HEIGHT = 320;
// Gap between the input and the menu, and breathing room from the viewport edge.
const MENU_OFFSET = 4;
const VIEWPORT_PADDING = 8;

export function useFloatingMenu(open: boolean): ReturnType<typeof useFloating> {
    const middleware = useMemo(
        () => [
            offset(MENU_OFFSET),
            flip({
                crossAxis: false,
                fallbackStrategy: "bestFit",
                padding: VIEWPORT_PADDING
            }),
            size({
                padding: VIEWPORT_PADDING,
                apply({ rects, elements, availableHeight }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${Math.min(availableHeight, MAX_MENU_HEIGHT)}px`
                    });
                }
            })
        ],
        []
    );

    const result = useFloating({
        open,
        placement: "bottom-start",
        strategy: "fixed",
        middleware,
        whileElementsMounted: autoUpdate
    });

    const floatingStyles =
        open && result.isPositioned
            ? result.floatingStyles
            : { ...result.floatingStyles, visibility: "hidden" as const };

    return { ...result, floatingStyles };
}
