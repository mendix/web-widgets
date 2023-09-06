import Big from "big.js";
import type { EditableValue } from "mendix";

type AttributeValue = EditableValue["value"];

const isDate = (x: unknown): x is Date => x instanceof Date;

const isBig = (x: unknown): x is Big => x instanceof Big;

const isBool = (x: unknown): x is boolean => typeof x === "boolean";

const isStr = (x: unknown): x is string => typeof x === "string";

const isUndef = (x: unknown): x is undefined => x === undefined;

const cmpStr = (x: string, y: string): number => x.localeCompare(y);

const cmpBool = (x: boolean, y: boolean): number => cmpStr(x.toString(), y.toString());

const cmpDate = (x: Date, y: Date): number => {
    const diff = x.getTime() - y.getTime();
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
};

const cmpBig = (x: Big, y: Big): number => x.cmp(y);

type CompareFn<T> = (a: T, b: unknown) => number;

function createCompare<T>(pred: (x: unknown) => x is T, cmp: (a: T, b: T) => number): CompareFn<T> {
    return (a, b) => (pred(b) ? cmp(a, b) : isUndef(b) ? -1 : 0);
}

const compareFns = {
    string: createCompare(isStr, cmpStr),
    boolean: createCompare(isBool, cmpBool),
    date: createCompare(isDate, cmpDate),
    big: createCompare(isBig, cmpBig),
    undefined(a: undefined, b: AttributeValue): number {
        return a === b ? 0 : 1;
    }
} as const;

/**
 * Comparison function for sorting items of type `AttributeValue`.
 * @param x
 * @param y
 * @returns {number}
 */
export function compareAttrValuesAsc(x: AttributeValue, y: AttributeValue): number {
    switch (typeof x) {
        case "string":
            return compareFns.string(x, y);
        case "boolean":
            return compareFns.boolean(x, y);
        case "undefined":
            return compareFns.undefined(x, y);
        default:
            return isDate(x) ? compareFns.date(x, y) : isBig(x) ? compareFns.big(x, y) : 0;
    }
}
