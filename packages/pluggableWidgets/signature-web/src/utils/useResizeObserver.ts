import { RefObject, useLayoutEffect, useRef } from "react";

type callbackFn<T> = (target: T, entry: ResizeObserverEntry) => void;

export function useResizeObserver<T extends HTMLElement>(callback: callbackFn<T>): RefObject<T | null> {
    const ref = useRef<T | null>(null);

    useLayoutEffect(() => {
        const element = ref?.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(entries => {
            callback(element, entries[0]);
        });

        observer.observe(element);
        return () => {
            observer.disconnect();
        };
    }, [callback, ref]);

    return ref;
}
