import { MutableRefObject, Ref, RefCallback } from "react";

export function mergeRefs<T>(...refs: Array<Ref<T>>): Ref<T> | RefCallback<T> | undefined {
    if (refs.length === 0) {
        return undefined;
    } else if (refs.length === 1) {
        return refs[0];
    } else {
        return ref => {
            for (const x of refs) {
                if (typeof x === "function") {
                    x(ref);
                } else if (x) {
                    (x as MutableRefObject<T | null>).current = ref;
                }
            }
        };
    }
}
