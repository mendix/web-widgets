import { autoUpdate, flip, size, useFloating } from "@floating-ui/react";
import { useMemo } from "react";

export function useFloatingMenu(open: boolean): ReturnType<typeof useFloating> {
    const middleware = useMemo(
        () => [
            flip({
                crossAxis: false,
                fallbackStrategy: "bestFit"
            }),
            size({
                apply({ rects, elements, availableHeight }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${availableHeight}px`
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
