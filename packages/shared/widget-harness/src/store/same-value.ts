import { Big } from "big.js";

/** Structural equality for request parameters: plain objects, arrays, `Big` and `Date` by value. */
export function sameValue(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (a instanceof Big && b instanceof Big) {
        return a.eq(b);
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
    }
    if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        return [...keys].every(k => sameValue((a as any)[k], (b as any)[k]));
    }
    return false;
}
