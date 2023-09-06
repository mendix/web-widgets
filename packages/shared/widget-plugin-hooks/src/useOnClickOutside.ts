import { RefObject, useEffect } from "react";

function onOuterEvents(
    refs: RefObject<HTMLElement> | Array<RefObject<HTMLElement>>,
    callback: () => void
): (event: MouseEvent) => void {
    const nodes = Array.isArray(refs) ? refs : [refs];
    return (event: MouseEvent) => {
        const isNotOurChild = nodes.every(({ current: elt }) => elt && !elt.contains(event.target as Node));
        if (isNotOurChild) {
            callback();
        }
    };
}

export function useOnClickOutside(
    refs: RefObject<HTMLElement> | Array<RefObject<HTMLElement>>,
    callback: () => void
): void {
    useEffect(() => {
        const { current: elt } = Array.isArray(refs) ? refs[0] : refs;

        if (!elt) {
            return;
        }

        const doc = elt.ownerDocument;
        const listener = onOuterEvents(refs, callback);
        doc.addEventListener("mousedown", listener);
        doc.addEventListener("touchstart", listener);
        return () => {
            doc.removeEventListener("mousedown", listener);
            doc.removeEventListener("touchstart", listener);
        };
    }, [refs, callback]);
}
