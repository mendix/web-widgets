import { computed } from "mobx";
import { ComputedAtom } from "../interfaces/ComputedAtom";

/** Creates a computed atom factory by composing a map function with a computation function. */
export function atomFactory<P extends readonly any[], A extends readonly any[], B>(
    map: (...args: P) => A,
    fn: (...args: A) => B
): (...args: P) => ComputedAtom<B> {
    return (...args: P) => computed(() => fn(...map(...args)));
}
