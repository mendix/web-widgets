import { Big } from "big.js";
import type { FilterCondition, FilterExpression } from "mendix/filters";
import type { DataStore } from "./DataStore.js";
import type { EntityObject, StoredValue } from "./schema.js";

type Expr = FilterExpression & Record<string, any>;

function resolve(expr: Expr, obj: EntityObject): StoredValue {
    switch (expr.type) {
        case "attribute":
            return obj.values[expr.attributeId];
        case "association":
            return obj.values[expr.associationId];
        case "literal":
            return expr.value;
        default:
            throw new Error(`Unexpected expression type "${expr.type}" as a value`);
    }
}

function isEmpty(value: StoredValue): boolean {
    return value === undefined || value === null || (Array.isArray(value) && value.length === 0);
}

/**
 * Three-way comparison. Strings compare case-insensitively, like XPath constraints in Mendix.
 * Returns `undefined` when either side is empty, so ordering operators on empty values are false.
 */
export function compareValues(a: StoredValue, b: StoredValue): number | undefined {
    if (isEmpty(a) || isEmpty(b)) {
        return undefined;
    }
    if (a instanceof Big && b instanceof Big) {
        return a.cmp(b);
    }
    if (a instanceof Date && b instanceof Date) {
        return Math.sign(a.getTime() - b.getTime());
    }
    if (typeof a === "string" && typeof b === "string") {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }
    if (typeof a === "boolean" && typeof b === "boolean") {
        return Number(a) - Number(b);
    }
    throw new Error(`Cannot compare ${String(a)} with ${String(b)}`);
}

function equalValues(a: StoredValue, b: StoredValue): boolean {
    if (isEmpty(a) || isEmpty(b)) {
        return isEmpty(a) && isEmpty(b);
    }
    if (Array.isArray(a) || Array.isArray(b)) {
        const left = ([] as StoredValue[]).concat(a);
        const right = ([] as StoredValue[]).concat(b);
        return left.length === right.length && left.every(v => right.includes(v));
    }
    return compareValues(a, b) === 0;
}

function startOfDay(value: StoredValue): Date | undefined {
    if (!(value instanceof Date)) {
        return undefined;
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function stringTest(a: StoredValue, b: StoredValue, test: (a: string, b: string) => boolean): boolean {
    if (Array.isArray(a)) {
        return typeof b === "string" && a.includes(b as any);
    }
    if (isEmpty(a) || isEmpty(b)) {
        return false;
    }
    return test(String(a).toLowerCase(), String(b).toLowerCase());
}

export function evaluateFilter(condition: FilterCondition, obj: EntityObject): boolean {
    const c = condition as Expr;
    switch (c.name) {
        case "and":
            return c.args.every((arg: FilterCondition) => evaluateFilter(arg, obj));
        case "or":
            return c.args.some((arg: FilterCondition) => evaluateFilter(arg, obj));
        case "not":
            return !evaluateFilter(c.arg, obj);
    }

    const a = resolve(c.arg1, obj);
    const b = resolve(c.arg2, obj);
    const cmp = (): number | undefined => compareValues(a, b);
    const dayCmp = (): number | undefined => compareValues(startOfDay(a), startOfDay(b));

    switch (c.name) {
        case "=":
            return equalValues(a, b);
        case "!=":
            return !equalValues(a, b);
        case ">":
            return (cmp() ?? 0) > 0;
        case ">=":
            return (cmp() ?? -1) >= 0;
        case "<":
            return (cmp() ?? 0) < 0;
        case "<=":
            return (cmp() ?? 1) <= 0;
        case "day:=":
            return dayCmp() === 0;
        case "day:!=":
            return dayCmp() !== 0;
        case "day:>":
            return (dayCmp() ?? 0) > 0;
        case "day:>=":
            return (dayCmp() ?? -1) >= 0;
        case "day:<":
            return (dayCmp() ?? 0) < 0;
        case "day:<=":
            return (dayCmp() ?? 1) <= 0;
        case "contains":
            return stringTest(a, b, (x, y) => x.includes(y));
        case "starts-with":
            return stringTest(a, b, (x, y) => x.startsWith(y));
        case "ends-with":
            return stringTest(a, b, (x, y) => x.endsWith(y));
        default:
            throw new Error(`Unsupported filter function "${c.name}"`);
    }
}

export type SortInstruction = [id: string, dir: "asc" | "desc"];

/** Empty values sort first in ascending order. Ties keep the store's insertion order. */
export function sortObjects(objects: EntityObject[], sortOrder: readonly SortInstruction[]): EntityObject[] {
    if (sortOrder.length === 0) {
        return objects;
    }
    return [...objects].sort((x, y) => {
        for (const [id, dir] of sortOrder) {
            const a = x.values[id];
            const b = y.values[id];
            const result = isEmpty(a) ? (isEmpty(b) ? 0 : -1) : isEmpty(b) ? 1 : compareValues(a, b)!;
            if (result !== 0) {
                return dir === "asc" ? result : -result;
            }
        }
        return 0;
    });
}

export function query(
    store: DataStore,
    entity: string,
    filters: Array<FilterCondition | undefined>,
    sortOrder: readonly SortInstruction[]
): EntityObject[] {
    const active = filters.filter((f): f is FilterCondition => f !== undefined);
    const matching = store.all(entity).filter(obj => active.every(f => evaluateFilter(f, obj)));
    return sortObjects(matching, sortOrder);
}
