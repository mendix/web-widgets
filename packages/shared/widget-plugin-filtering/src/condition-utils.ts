import {
    FilterCondition,
    AndCondition,
    OrCondition,
    LiteralExpression,
    ContainsCondition,
    EqualsCondition
} from "mendix/filters";
import { equals, literal, and } from "mendix/filters/builders";

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

interface TagCond {
    readonly type: "function";
    readonly name: "=";
    readonly arg1: TagName;
    readonly arg2: TagName;
}

export function tag(name: string): TagCond {
    return equals(literal(name), literal(name)) as TagCond;
}

export function isTag(cond: FilterCondition): cond is TagCond {
    return (
        cond.name === "=" &&
        cond.arg1.type === "literal" &&
        cond.arg2.type === "literal" &&
        /string/i.test(cond.arg1.valueType) &&
        /string/i.test(cond.arg2.valueType) &&
        cond.arg1.value === cond.arg2.value
    );
}

type ArrayMeta = readonly [len: number, indexes: number[]];

function arrayTag(meta: ArrayMeta): string {
    return JSON.stringify(meta);
}

function fromArrayTag(tag: string): ArrayMeta | undefined {
    let len: ArrayMeta[0];
    let indexes: ArrayMeta[1];
    try {
        [len, indexes] = JSON.parse(tag);
    } catch {
        return undefined;
    }
    if (typeof len !== "number" || !Array.isArray(indexes) || !indexes.every(x => typeof x === "number")) {
        return undefined;
    }
    return [len, indexes];
}

function shrink<T>(array: Array<T | undefined>): [indexes: number[], items: T[]] {
    return [array.flatMap((x, i) => (x === undefined ? [] : [i])), array.filter((x): x is T => x !== undefined)];
}

export function compactArray(input: Array<FilterCondition | undefined>): FilterCondition {
    const [indexes, items] = shrink(input);
    const arrayMeta = [input.length, indexes] as const;
    const metaTag = tag(arrayTag(arrayMeta));
    // As 'and' requires at least 2 args, we add a placeholder
    const placeholder = tag("_");
    return and(metaTag, placeholder, ...items);
}

export function fromCompactArray(cond: FilterCondition): Array<FilterCondition | undefined> {
    if (!isAnd(cond)) {
        return [];
    }

    const [metaTag] = cond.args;
    const arrayMeta = isTag(metaTag) ? fromArrayTag(metaTag.arg1.value) : undefined;

    if (!arrayMeta) {
        return [];
    }

    const [length, indexes] = arrayMeta;
    const arr: Array<FilterCondition | undefined> = Array(length).fill(undefined);
    cond.args.slice(2).forEach((cond, i) => {
        arr[indexes[i]] = cond;
    });

    return arr;
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
