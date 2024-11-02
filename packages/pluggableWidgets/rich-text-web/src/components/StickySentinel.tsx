import classNames from "classnames";
import { createElement, ReactElement, useEffect, useRef, useState } from "react";

/**
 *  * duplicate with datagrid-web sticky sentinel,
 * TODO: possibly update to shared component in later stage
 *
 * StickySentinel - A small hidden element that uses "IntersectionObserver"
 * to detect the "scrolled" state of the grid. By toggling the "container-stuck" class
 * on this element, we can force "position: sticky" for column headers.
 */
export function StickySentinel(): ReactElement {
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
