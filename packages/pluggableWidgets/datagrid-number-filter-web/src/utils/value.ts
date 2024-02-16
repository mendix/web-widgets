import { Big } from "big.js";

export function toBig(value: any): Big | undefined {
    try {
        return new Big(value);
    } catch {
        return undefined;
    }
}

export function toString(value: Big | undefined): string {
    return value instanceof Big ? value.toString() : "";
}

export function equals(a: Big | undefined, b: Big | undefined): boolean {
    return a && b ? a.eq(b) : a === b;
}
