import { Big } from "big.js";

export function toBig(value: any): Big | undefined {
    try {
        return new Big(value);
    } catch {
        return undefined;
    }
}

export function toInputValue(value: Big | undefined): string {
    return value instanceof Big ? value.toString() : "";
}
