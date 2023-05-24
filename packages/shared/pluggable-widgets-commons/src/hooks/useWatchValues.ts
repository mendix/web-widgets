/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect } from "react";

export function useWatchValues(cb: (prev: unknown[], next: unknown[]) => any, values: unknown[]): void {
    const prev = useRef<undefined | unknown[]>(undefined);

    useEffect(() => {
        if (prev.current !== undefined) {
            cb(prev.current, values);
        }
        prev.current = values;
    }, values);
}
