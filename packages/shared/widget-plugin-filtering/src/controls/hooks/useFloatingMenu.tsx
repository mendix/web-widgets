import { useMemo } from "react";
import { autoUpdate, size, useFloating } from "@floating-ui/react-dom";

export function useFloatingMenu(open: boolean): ReturnType<typeof useFloating> {
    const middleware = useMemo(
        () => [
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`
                    });
                }
            })
        ],
        []
    );

    return useFloating({
        open,
        placement: "bottom-start",
        strategy: "fixed",
        middleware,
        whileElementsMounted: autoUpdate
    });
}
