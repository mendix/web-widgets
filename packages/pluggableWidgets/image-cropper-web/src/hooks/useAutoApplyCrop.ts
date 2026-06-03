import { useEffect, useMemo, useRef } from "react";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

const DEBOUNCE_MS = 400;

export interface AutoApplyCrop {
    armed: () => void;
    applyNow: () => void;
    applyDebounced: () => void;
}

export function useAutoApplyCrop(applyCrop: () => void | Promise<void>): AutoApplyCrop {
    const latest = useRef(applyCrop);
    latest.current = applyCrop;

    const userInteracted = useRef(false);

    const [applyDebounced, abort] = useMemo(
        () =>
            debounce(() => {
                if (userInteracted.current) {
                    latest.current();
                }
            }, DEBOUNCE_MS),
        []
    );

    useEffect(() => abort, [abort]);

    return useMemo(
        () => ({
            armed: () => {
                userInteracted.current = false;
            },
            applyNow: () => {
                userInteracted.current = true;
                abort();
                latest.current();
            },
            applyDebounced: () => {
                userInteracted.current = true;
                applyDebounced();
            }
        }),
        [abort, applyDebounced]
    );
}
