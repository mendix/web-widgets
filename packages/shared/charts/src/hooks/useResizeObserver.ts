import { RefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

type callbackFn<T> = (target: T, entry: ResizeObserverEntry) => void;

export function useDispatchResizeObserver<T extends HTMLElement>(): RefObject<T | null> {
    const [callResizeObserverDebounce, abort] = useMemo(
        () =>
            debounce((_target: T) => {
                window.dispatchEvent(new Event("resize"));
            }, 100),
        []
    );

    useEffect(() => abort, [abort]);

    return useResizeObserver(callResizeObserverDebounce);
}

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
