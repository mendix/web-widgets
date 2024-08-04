import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { RefObject, useEffect, useMemo } from "react";
import "../ui/accordion-main.scss";

type ResizeObserverProps = {
    renderCollapsed: boolean;
    contentWrapperRef: RefObject<HTMLDivElement>;
    contentRef: RefObject<HTMLDivElement>;
};

export function CallResizeObserver(entries: ResizeObserverEntry[], props: ResizeObserverProps): void {
    const { renderCollapsed, contentWrapperRef, contentRef } = props;
    for (const entry of entries) {
        if (entry.contentBoxSize && !renderCollapsed && contentWrapperRef.current && contentRef.current) {
            contentWrapperRef.current.style.height = `${contentRef.current.getBoundingClientRect().height}px`;
        }
    }
}

export function useDebouncedResizeObserver(callback: typeof CallResizeObserver, props: ResizeObserverProps): void {
    const { contentRef } = props;
    const [callResizeObserverDebounce] = useMemo(
        () => debounce((entries: ResizeObserverEntry[]) => callback(entries, props), 32),
        [callback, props]
    );

    useEffect(() => {
        const observer = new ResizeObserver(callResizeObserverDebounce);
        if (contentRef.current) {
            observer.observe(contentRef.current);
        }
        return () => {
            observer.disconnect();
        };
    }, [callResizeObserverDebounce, props, contentRef]);
}
