import classNames from "classnames";
import { createElement, ReactElement, useState, useEffect, useRef } from "react";

// this wrapper component works by adding "sticky-sentinel" div (and hides it using margin-bottom -1px)
// in order to detect table going out of viewport
// this allows position: sticky to only applies when container is "stuck"
// this way we allow any absolute position to still be on top when sticky not "stuck"
export function StickyHeaderTable(): ReactElement {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [ratio, setRatio] = useState(1);

    useEffect(() => {
        const target = sentinelRef.current;

        if (target === null) {
            return;
        }

        return createObserver(target, setRatio);
    }, []);

    return (
        <div
            className={classNames("sticky-sentinel", {
                "container-stuck": ratio === 0
            })}
            ref={sentinelRef}
            style={{ height: 1, marginBottom: "-1px" }}
        />
    );
}

function createObserver(target: Element, onIntersectionChange: (ratio: number) => void): () => void {
    const options = { threshold: [0, 1] };

    const observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio === 0 || entry.intersectionRatio === 1) {
            onIntersectionChange(entry.intersectionRatio);
        }
    }, options);

    observer.observe(target);

    return () => observer.unobserve(target);
}
