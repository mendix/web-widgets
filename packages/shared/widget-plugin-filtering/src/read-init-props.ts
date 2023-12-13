import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";

export type BinaryExpression<T = FilterCondition> = T extends { arg1: unknown; arg2: object } ? T : never;
export type InitialFilterValue = { type: BinaryExpression["name"]; value: LiteralExpression["value"] };

const hasOwn = (o: object, k: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(o, k);

function isBinary(cond: FilterCondition): cond is BinaryExpression {
    return hasOwn(cond, "arg1") && hasOwn(cond, "arg2");
}

function isTypedLiteral(exp: object): exp is LiteralExpression {
    return hasOwn(exp, "type") && hasOwn(exp, "value");
}

/**
 * This function check condition type and if it's an attribute condition (see mendix/filters),
 * then it pull name and value from that condition.
 * Typical use case - extract filter init props from datasource.filter property.
 */
function getInitValueByAttr(cond: FilterCondition, attr: ListAttributeValue): InitialFilterValue | undefined {
    if (
        isBinary(cond) &&
        cond.arg1.type === "attribute" &&
        cond.arg1.attributeId === attr.id &&
        isTypedLiteral(cond.arg2)
    ) {
        return {
            type: cond.name,
            value: cond.arg2.value
        };
    }

    return undefined;
}

/**
 * @remark If we have more then one item in array,
 * that means ether:
 * - that we have same attribute used in two places
 * - that some of the filters (usually date) use "between"
 */
export function readInitFilterValues(
    attribute: ListAttributeValue | undefined,
    dataSourceFilter?: FilterCondition
): InitialFilterValue[] {
    if (!attribute || !dataSourceFilter) {
        return [];
    }
    const cs = splitAndOrStatements(dataSourceFilter) ?? [];
    return cs.flatMap(cond => {
        const value = getInitValueByAttr(cond, attribute);
        return value ? [value] : [];
    });
}

/**
 * If expression is "and" or "or", then unwrap expression by returning it's arguments.
 * For other expressions just wrap exp in array.
 * @remark Function is recursive, which is probably side effect. I don't know why.
 * Probably this is needed in case of "grid wide" (multi attr) filters.
 */
export function splitAndOrStatements(filter?: FilterCondition): FilterCondition[] | undefined {
    if (filter && filter.type === "function" && (filter.name === "and" || filter.name === "or")) {
        return filter.args.flatMap(splitAndOrStatements).filter(f => f !== undefined) as FilterCondition[];
    }
    return filter ? [filter] : undefined;
}

export function unwrapAndExpression(filter: FilterCondition | undefined): FilterCondition[] {
    if (filter === undefined) {
        return [];
    }

    if (filter.name === "and") {
        return [...filter.args];
    }

    return [filter];
}
