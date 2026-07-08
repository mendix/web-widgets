import { autoUpdate, flip, size, useFloating } from "@floating-ui/react";
import { useMemo } from "react";

export function useFloatingMenu(open: boolean): ReturnType<typeof useFloating> {
    const middleware = useMemo(
        () => [
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`
                    });
                }
            }),
            flip({
                crossAxis: false,
                fallbackStrategy: "bestFit"
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
