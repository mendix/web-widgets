import { useLayoutEffect, useRef, RefObject } from "react";

type callbackFn<T> = (target: T, entry: ResizeObserverEntry) => void;

function useResizeObserver<T extends HTMLElement>(callback: callbackFn<T>): RefObject<T> {
    const ref = useRef<T>(null);

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

export default useResizeObserver;
