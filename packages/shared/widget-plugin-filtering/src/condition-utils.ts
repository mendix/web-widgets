import { FilterCondition, AndCondition, OrCondition, LiteralExpression } from "mendix/filters";
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

function placeholder(): FilterCondition {
    return equals(literal(true), literal(true));
}

function isPlaceholder(exp: FilterCondition): boolean {
    return (
        exp.name === "=" &&
        exp.arg1.type === "literal" &&
        exp.arg2.type === "literal" &&
        exp.arg1.value === true &&
        exp.arg2.value === true
    );
}

export function conjoin(exp: Array<FilterCondition | undefined>): FilterCondition {
    switch (exp.length) {
        case 0:
            return and(placeholder(), placeholder());
        case 1:
            return and(exp.at(0) ?? placeholder(), placeholder());
        default: {
            return and(...exp.map(x => (x === undefined ? placeholder() : x)));
        }
    }
}

export function disjoin(exp: FilterCondition): Array<FilterCondition | undefined> {
    if (exp.name !== "and") {
        throw new Error('only "and" expression is supported');
    }

    return exp.args.map(x => (isPlaceholder(x) ? undefined : x));
}

export function inputStateFromCond<Fn, V>(
    cond: FilterCondition,
    fn: (func: FilterFunction | "between" | "empty" | "notEmpty") => Fn,
    val: (exp: LiteralExpression) => V
): null | [Fn, V] | [Fn, V, V] {
    if (isPlaceholder(cond)) {
        return null;
    }

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
