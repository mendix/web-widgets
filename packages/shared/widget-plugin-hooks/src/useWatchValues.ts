/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect } from "react";

export function useWatchValues<T1, K extends [T1]>(cb: (prev: K, next: K) => any, values: K): void;
export function useWatchValues<T1, T2, K extends [T1, T2]>(cb: (prev: K, next: K) => any, values: K): void;
export function useWatchValues<T1, T2, T3, K extends [T1, T2, T3]>(cb: (prev: K, next: K) => any, values: K): void;
export function useWatchValues<T1, T2, T3, T4, K extends [T1, T2, T3, T4]>(
    cb: (prev: K, next: K) => any,
    values: K
): void;
export function useWatchValues<T1, T2, T3, T4, T5, K extends [T1, T2, T3, T4, T5]>(
    cb: (prev: K, next: K) => any,
    values: K
): void;
export function useWatchValues(cb: (prev: unknown[], next: unknown[]) => any, values: unknown[]): void {
    const prev = useRef<undefined | unknown[]>(undefined);

    useEffect(() => {
        if (prev.current !== undefined) {
            cb(prev.current, values);
        }
        prev.current = values;
    }, values);
}
