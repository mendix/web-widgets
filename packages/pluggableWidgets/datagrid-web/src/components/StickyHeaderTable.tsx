import { createElement, ReactElement, useCallback, useEffect, useRef, PropsWithChildren, Fragment } from "react";

// this wrapper component works by adding "sticky-sentinel" div (and hides it using margin-bottom -1px)
// in order to detect table going out of viewport
// this allows position: sticky to only applies when container is "stuck"
// this way we allow any absolute position to still be on top when sticky not "stuck"
export function StickyHeaderTable(props: PropsWithChildren): ReactElement {
    const headerContainer = useRef<HTMLDivElement>(null);
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
        <Fragment>
            <div className="sticky-sentinel" ref={headerContainer} style={{ height: 1, marginBottom: "-1px" }}></div>
            <div className="table" role="table">
                {props.children}
            </div>
        </Fragment>
    );
}
