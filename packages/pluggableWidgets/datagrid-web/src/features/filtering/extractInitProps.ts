import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";

type BinaryExpression<T = FilterCondition> = T extends { arg1: unknown; arg2: object } ? T : never;
type FilterFunction = BinaryExpression["name"];
type FilterValue = LiteralExpression["value"];

export type ExtractedFilterProps = { type: FilterFunction; value: FilterValue };

function isBinary(cond: FilterCondition): cond is BinaryExpression {
    return Object.hasOwn(cond, "arg1") && Object.hasOwn(cond, "arg2");
}

function isTypedLiteral(exp: object): exp is LiteralExpression {
    return Object.hasOwn(exp, "type") && Object.hasOwn(exp, "value");
}

function extractFilterProps(cond: FilterCondition, attr: ListAttributeValue): ExtractedFilterProps | undefined {
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
}

/**
 * @remark I have no idea why we return array.
 * None of data grid settings combination allow
 * multiple conditions for same attribute.
 */
export function extractFilters(
    attribute: ListAttributeValue | undefined,
    dataSourceFilter?: FilterCondition
): ExtractedFilterProps[] {
    if (!attribute || !dataSourceFilter) {
        return [];
    }
    return (extractAndOrStatements(dataSourceFilter) ?? []).flatMap(cond => {
        const props = extractFilterProps(cond, attribute);
        return props ? [props] : [];
    });
}

function extractAndOrStatements(filter?: FilterCondition): FilterCondition[] | undefined {
    if (filter && filter.type === "function" && (filter.name === "and" || filter.name === "or")) {
        return filter.args.flatMap(extractAndOrStatements).filter(f => f !== undefined) as FilterCondition[];
    }
    return filter ? [filter] : undefined;
}
