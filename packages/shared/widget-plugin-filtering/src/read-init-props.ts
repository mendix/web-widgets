import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";

export type BinaryExpression<T = FilterCondition> = T extends { arg1: unknown; arg2: object } ? T : never;
export type FilterFunction = BinaryExpression["name"];
export type InitialFilterProps = { type: FilterFunction; value: LiteralExpression["value"] };

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
function getInitPropsByAttr(cond: FilterCondition, attr: ListAttributeValue): InitialFilterProps | undefined {
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
 * @remark I have no idea why we return array.
 * None of data grid settings combination allow
 * multiple conditions for same attribute.
 */
export function readInitFilterProps(
    attribute: ListAttributeValue | undefined,
    dataSourceFilter?: FilterCondition
): InitialFilterProps[] {
    if (!attribute || !dataSourceFilter) {
        return [];
    }
    return (splitAndOrStatements(dataSourceFilter) ?? []).flatMap(cond => {
        const props = getInitPropsByAttr(cond, attribute);
        return props ? [props] : [];
    });
}

/**
 * If expression is "and" or "or", then unwrap expression by returning it's arguments.
 * For other expressions just wrap exp in array.
 * @remark Function is recursive, which is probably side effect. I don't know why.
 * Probably this is needed in case of "grid wide" (multi attr) filters.
 */
function splitAndOrStatements(filter?: FilterCondition): FilterCondition[] | undefined {
    if (filter && filter.type === "function" && (filter.name === "and" || filter.name === "or")) {
        return filter.args.flatMap(splitAndOrStatements).filter(f => f !== undefined) as FilterCondition[];
    }
    return filter ? [filter] : undefined;
}
