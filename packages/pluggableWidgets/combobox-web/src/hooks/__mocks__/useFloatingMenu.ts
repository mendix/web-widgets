import { useRef } from "react";

export function useFloatingMenu(_open: boolean): any {
    const ref = useRef<HTMLDivElement>(null);
    const float = useRef<HTMLDivElement>(null);
    return {
        refs: {
            setReference: ref,
            setFloating: float
        },
        floatingStyles: {
            "--this-is-mocked-from-unit-tests": "true"
        },
        isPositioned: true
    };
}
