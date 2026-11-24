/**
 * Browser and Node implementation of `mendix/filters/builders`, written against the public typings.
 * Produces plain condition trees that `evaluateFilter` understands.
 */
import { Big } from "big.js";
import type { ObjectItem } from "mendix";
import type {
    AndCondition,
    AssociationExpression,
    AttributeExpression,
    FilterCondition,
    LiteralExpression,
    NotCondition,
    OrCondition,
    ValueExpression
} from "mendix/filters";

type LiteralInput = undefined | string | boolean | Date | Big | ObjectItem | ObjectItem[];

function isObjectItem(value: unknown): value is ObjectItem {
    return typeof value === "object" && value !== null && "id" in value && typeof value.id === "string";
}

export function literal(value: LiteralInput): LiteralExpression {
    const make = (valueType: string, v: unknown): LiteralExpression =>
        ({ type: "literal", value: v, valueType }) as LiteralExpression;

    if (value === undefined) {
        return make("undefined", undefined);
    }
    if (typeof value === "string") {
        return make("string", value);
    }
    if (typeof value === "boolean") {
        return make("boolean", value);
    }
    if (value instanceof Date) {
        return make("DateTime", value);
    }
    if (value instanceof Big) {
        return make("Numeric", value);
    }
    if (Array.isArray(value)) {
        return make(
            "ReferenceSet",
            value.map(item => item.id)
        );
    }
    if (isObjectItem(value)) {
        return make("Reference", value.id);
    }
    throw new Error(`literal: unsupported value ${String(value)}`);
}

export function empty(): LiteralExpression {
    return literal(undefined);
}

export function attribute(attributeId: string): AttributeExpression {
    return { type: "attribute", attributeId } as AttributeExpression;
}

export function association(associationId: string): AssociationExpression {
    return { type: "association", associationId } as AssociationExpression;
}

function binary(name: string) {
    return (arg1: ValueExpression, arg2: ValueExpression): any => ({ type: "function", name, arg1, arg2 });
}

export const equals = binary("=");
export const notEqual = binary("!=");
export const greaterThan = binary(">");
export const greaterThanOrEqual = binary(">=");
export const lessThan = binary("<");
export const lessThanOrEqual = binary("<=");
export const dayEquals = binary("day:=");
export const dayNotEqual = binary("day:!=");
export const dayGreaterThan = binary("day:>");
export const dayGreaterThanOrEqual = binary("day:>=");
export const dayLessThan = binary("day:<");
export const dayLessThanOrEqual = binary("day:<=");
export const contains = binary("contains");
export const startsWith = binary("starts-with");
export const endsWith = binary("ends-with");

function multiary(name: "and" | "or") {
    return (...args: FilterCondition[]): any => {
        if (args.length < 2) {
            throw new Error(`${name}: expects at least two arguments`);
        }
        return { type: "function", name, args };
    };
}

export const and: (...args: FilterCondition[]) => AndCondition = multiary("and");
export const or: (...args: FilterCondition[]) => OrCondition = multiary("or");

export function not(arg: FilterCondition): NotCondition {
    return { type: "function", name: "not", arg } as NotCondition;
}
