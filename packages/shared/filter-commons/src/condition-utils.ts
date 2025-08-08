import {
    AndCondition,
    ContainsCondition,
    EqualsCondition,
    FilterCondition,
    LiteralExpression,
    OrCondition
} from "mendix/filters";
import { and, literal, notEqual } from "mendix/filters/builders";

type BinaryExpression<T = FilterCondition> = T extends { arg1: unknown; arg2: object } ? T : never;
type Func<T> = T extends { name: infer Fn } ? Fn : never;
type FilterFunction = Func<FilterCondition>;

const hasOwn = (o: object, k: PropertyKey): boolean => Object.hasOwn(o, k);

export function isBinary(cond: FilterCondition): cond is BinaryExpression {
    return hasOwn(cond, "arg1") && hasOwn(cond, "arg2");
}

export function isAnd(exp: FilterCondition): exp is AndCondition {
    return exp.type === "function" && exp.name === "and";
}

export function isOr(exp: FilterCondition): exp is OrCondition {
    return exp.type === "function" && exp.name === "or";
}

export function isEmptyExp(exp: FilterCondition): boolean {
    return isBinary(exp) && exp.arg2.type === "literal" && exp.name === "=" && exp.arg2.valueType === "undefined";
}

export function isNotEmptyExp(exp: FilterCondition): boolean {
    return isBinary(exp) && exp.arg2.type === "literal" && exp.name === "!=" && exp.arg2.valueType === "undefined";
}

interface TagName {
    readonly type: "literal";
    readonly value: string;
    readonly valueType: "string";
}

const MARKER = "#";

interface TagMarker {
    readonly type: "literal";
    readonly value: typeof MARKER;
    readonly valueType: "string";
}

interface TagCond {
    readonly type: "function";
    readonly name: "!=";
    readonly arg1: TagName;
    readonly arg2: TagMarker;
}

/** @deprecated use for unit tests only */
export function tag(name: string): TagCond {
    return notEqual(literal(name), literal(MARKER)) as TagCond;
}

export function isTag(cond: FilterCondition): cond is TagCond {
    return (
        cond.name === "!=" &&
        cond.arg1.type === "literal" &&
        cond.arg2.type === "literal" &&
        /string/i.test(cond.arg1.valueType) &&
        /string/i.test(cond.arg2.valueType) &&
        cond.arg2.value === MARKER
    );
}

type ArrayMeta = readonly [len: number, indexes: number[]];

function shrink<T>(array: Array<T | undefined>): [indexes: number[], items: T[]] {
    return [array.flatMap((x, i) => (x === undefined ? [] : [i])), array.filter((x): x is T => x !== undefined)];
}

export function reduceArray(
    input: Array<FilterCondition | undefined>
): [cond: FilterCondition | undefined, meta: string] {
    const [indexes, items] = shrink(input);
    const meta = JSON.stringify([input.length, indexes]);

    switch (items.length) {
        case 0:
            return [undefined, meta];
        case 1:
            return [items[0], meta];
        default:
            return [and(...items), meta];
    }
}

export function restoreArray(cond: FilterCondition | undefined, meta: string): Array<FilterCondition | undefined> {
    const [length, indexes] = JSON.parse(meta) as ArrayMeta;
    const arr: Array<FilterCondition | undefined> = Array(length).fill(undefined);

    if (indexes.length === 0) {
        return arr;
    }
    if (indexes.length === 1) {
        arr[indexes[0]] = cond;
        return arr;
    }
    if (cond && isAnd(cond)) {
        cond.args.forEach((c, i) => {
            arr[indexes[i]] = c;
        });
        return arr;
    }

    return arr;
}

type ReduceMapMeta = {
    [index: number]: string;
    length: number;
    keys: string[];
};

export function reduceMap(input: Record<string, FilterCondition | undefined>): [FilterCondition | undefined, string] {
    const meta: ReduceMapMeta = { length: 0, keys: [] };
    const conditions: FilterCondition[] = [];
    for (const [key, value] of Object.entries(input)) {
        meta.keys.push(key);
        if (value !== undefined) {
            meta[conditions.length] = key;
            conditions.push(value);
        }
    }
    meta.length = conditions.length;

    const metaJson = JSON.stringify(meta);

    switch (conditions.length) {
        case 0:
            return [undefined, metaJson];
        case 1:
            return [conditions[0], metaJson];
        default:
            return [and(...conditions), metaJson];
    }
}

export function restoreMap(
    cond: FilterCondition | undefined,
    metaJson: string
): Record<string, FilterCondition | undefined> {
    const meta = JSON.parse(metaJson) as ReduceMapMeta;
    const result: Record<string, FilterCondition | undefined> = {};

    for (const key of meta.keys) {
        result[key] = undefined;
    }

    if (meta.length === 0) {
        return result;
    }

    if (meta.length === 1 && meta[0]) {
        result[meta[0]] = cond;
        return result;
    }

    if (cond && isAnd(cond)) {
        cond.args.forEach((c, i) => {
            result[meta[i]] = c;
        });
        return result;
    }

    return result;
}

export function inputStateFromCond<Fn, V>(
    cond: FilterCondition,
    fn: (func: FilterFunction | "between" | "empty" | "notEmpty") => Fn,
    val: (exp: LiteralExpression) => V
): null | [Fn, V] | [Fn, V, V] {
    // Or - condition build for multiple attrs, get state from the first one.
    if (isOr(cond)) {
        return inputStateFromCond(cond.args[0], fn, val);
    }

    // Between
    if (isAnd(cond)) {
        return betweenToState(cond, fn, val);
    }

    return singularToState(cond, fn, val);
}

export function betweenToState<Fn, V>(
    cond: AndCondition,
    fn: (func: "between") => Fn,
    val: (exp: LiteralExpression) => V
): null | [Fn, V, V] {
    const [exp1, exp2] = cond.args;
    const [v1, v2] = [expValue(exp1, val), expValue(exp2, val)];
    if (v1 && v2) {
        return [fn("between"), v1, v2];
    }
    return null;
}

export function singularToState<Fn, V>(
    cond: FilterCondition,
    fn: (func: FilterFunction | "between" | "empty" | "notEmpty") => Fn,
    val: (exp: LiteralExpression) => V
): null | [Fn, V] {
    const value = expValue(cond, val);
    if (value === null) {
        return null;
    }

    if (isEmptyExp(cond)) {
        return [fn("empty"), value];
    }
    if (isNotEmptyExp(cond)) {
        return [fn("notEmpty"), value];
    }

    return [fn(cond.name), value];
}

export function expValue<V>(exp: FilterCondition, val: (exp: LiteralExpression) => V): null | V {
    if (!isBinary(exp)) {
        return null;
    }
    if (exp.arg2.type !== "literal") {
        return null;
    }
    return val(exp.arg2);
}

export function selectedFromCond<V extends string>(
    cond: FilterCondition,
    val: (exp: LiteralExpression) => V | undefined
): V[] {
    const reduce = (acc: V[], cond: FilterCondition): V[] => {
        if (cond.name === "or") {
            return cond.args.reduce(reduce, acc);
        }

        if (cond.name === "=" || cond.name === "contains") {
            const item = expValue(cond, val);
            if (item != null) {
                acc.push(item);
            }
        }

        return acc;
    };

    return [cond].reduce(reduce, []);
}

export function flattenRefCond(cond: FilterCondition): Array<ContainsCondition | EqualsCondition> {
    return [cond].flatMap(exp => {
        if (exp.name === "or") {
            return exp.args.flatMap(flattenRefCond);
        }
        if (exp.name === "=" || exp.name === "contains") {
            return [exp];
        }
        return [];
    });
}
