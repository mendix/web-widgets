import { useRef } from "react";

// Jest mock for useFloatingMenu: returns stable refs and a marker style so specs can
// assert wiring without depending on a real layout engine (jsdom has none).
export function useFloatingMenu(_open: boolean): any {
    const reference = useRef<HTMLDivElement>(null);
    const floating = useRef<HTMLDivElement>(null);
    return {
        refs: {
            setReference: reference,
            setFloating: floating
        },
        floatingStyles: {
            "--this-is-mocked-from-unit-tests": "true"
        },
        isPositioned: true
    };
}
