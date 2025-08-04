import { useMemo } from "react";
import { autoUpdate, size, useFloating, ReferenceType } from "@floating-ui/react-dom";

export function useFloatingMenu<T extends ReferenceType = HTMLDivElement>(
    open: boolean
): ReturnType<typeof useFloating<T>> {
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

    return useFloating<T>({
        open,
        placement: "bottom-start",
        strategy: "fixed",
        middleware,
        whileElementsMounted: autoUpdate
    });
}
