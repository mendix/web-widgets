import { Big } from "big.js";

export function _valuesIsEqual(
    value1: string | Big | boolean | Date | undefined,
    value2: string | Big | boolean | Date | undefined
): boolean {
    if (value1 === value2) {
        return true;
    }

    if (value1 instanceof Big && value2 instanceof Big) {
        return value1.eq(value2);
    }

    if (value1 instanceof Date && value2 instanceof Date) {
        return value1.getTime() === value2.getTime();
    }

    return false;
}
