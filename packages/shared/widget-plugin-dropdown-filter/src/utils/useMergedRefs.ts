import { Ref, useCallback, useRef } from "react";

export function useMergedRefs<T>(...refs: Array<Ref<T> | null | undefined>): (node: T | null) => void {
    const refsRef = useRef(refs);
    refsRef.current = refs;

    return useCallback((node: T | null) => {
        for (const ref of refsRef.current) {
            if (!ref) {
                continue;
            }

            if (typeof ref === "function") {
                ref(node);
            } else {
                ref.current = node;
            }
        }
    }, []);
}
