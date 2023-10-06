import { createElement, ReactElement, useCallback, useEffect, useRef } from "react";

// this wrapper component works by adding "sticky-sentinel" div (and hides it using margin-bottom -1px)
// in order to detect table going out of viewport
// this allows position: sticky to only applies when container is "stuck"
// this way we allow any absolute position to still be on top when sticky not "stuck"
export function StickyHeaderTable(): ReactElement {
    const headerContainer = useRef<HTMLDivElement>(null);
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl(props);

    const observerCallback = useCallback((entry: [IntersectionObserverEntry]) => {
        const [e] = entry;
        if (e.intersectionRatio === 1) {
            e.target.classList.remove("container-stuck");
        }

        if (e.intersectionRatio === 0) {
            e.target.classList.add("container-stuck");
        }
    }, []);

    useEffect(() => {
        let observerRefValue: HTMLDivElement | null = null;
        const observer = new IntersectionObserver(observerCallback, { threshold: [0, 1] });
        if (headerContainer.current) {
            observer.observe(headerContainer.current);
            observerRefValue = headerContainer.current;
        }
        return () => {
            if (observerRefValue) {
                observer.unobserve(observerRefValue);
            }
        };
    }, [headerContainer]);

    return <div className="sticky-sentinel" ref={headerContainer} style={{ height: 1, marginBottom: "-1px" }} />;
}
