import classNames from "classnames";
import { PropsWithChildren, ReactElement, createElement, useCallback, useEffect, useRef } from "react";
import { InfiniteBodyProps, useInfiniteControl } from "./InfiniteBody";

// this wrapper component works by adding "sticky-sentinel" div (and hides it using margin-bottom -1px)
// in order to detect table going out of viewport
// this allows position: sticky to only applies when container is "stuck"
// this way we allow any absolute position to still be on top when sticky not "stuck"
export function StickyHeaderTable(props: PropsWithChildren<InfiniteBodyProps>): ReactElement {
    const { className, isInfinite, children } = props;
    const headerContainer = useRef<HTMLDivElement>(null);
    const [trackScrolling, bodySize, containerRef] = useInfiniteControl(props);

    const observerCallback = useCallback(
        (entry: [IntersectionObserverEntry]) => {
            const [e] = entry;
            if (e.intersectionRatio === 1) {
                e.target.classList.remove("container-stuck");
            }

            if (e.intersectionRatio === 0) {
                e.target.classList.add("container-stuck");
            }
        },
        [headerContainer]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, { threshold: [0, 1] });
        if (headerContainer.current) {
            observer.observe(headerContainer.current);
        }
        return () => {
            if (headerContainer.current) {
                observer.unobserve(headerContainer.current);
            }
        };
    }, [headerContainer]);

    return (
        <div
            className={classNames("sticky-table-container", className, { "infinite-loading": isInfinite })}
            ref={containerRef}
            onScroll={isInfinite ? trackScrolling : undefined}
            role={props.role}
            style={isInfinite && bodySize > 0 ? { ...props.style, maxHeight: bodySize } : props.style}
        >
            <div className="sticky-sentinel" ref={headerContainer} style={{ height: 1, marginBottom: "-1px" }}></div>
            <div className="table" role="table">
                {children}
            </div>
        </div>
    );
}
