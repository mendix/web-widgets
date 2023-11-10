import { ListAttributeValue } from "mendix";
import { FilterCondition, FilterExpression, LiteralExpression } from "mendix/filters";
import { InitialFilterProps, BinaryExpression } from "@mendix/widget-plugin-filtering";

declare type SingleFilterCondition = FilterCondition & {
    arg1: FilterExpression;
    arg2: LiteralExpression;
};

export function extractFilters(
    attribute: ListAttributeValue | undefined,
    filter?: FilterCondition
): InitialFilterProps[] {
    if (!attribute || !filter) {
        return [];
    }
    const filters = extractAndOrStatements(filter);
    return filters
        ? filters
              .filter((a: SingleFilterCondition) => !!a.arg1 && !!a.arg2)
              .flatMap((f: BinaryExpression) => {
                  if (f.arg1.type === "attribute" && f.arg1.attributeId === attribute.id && f.arg2.type === "literal") {
                      return [
                          {
                              type: f.name,
                              value: f.arg2.value
                          }
                      ];
                  }
                  return [];
              })
        : [];
}

function extractAndOrStatements(filter?: FilterCondition): FilterCondition[] | undefined {
    if (filter && filter.type === "function" && (filter.name === "and" || filter.name === "or")) {
        return filter.args.flatMap(extractAndOrStatements).filter(f => f !== undefined) as FilterCondition[];
    }
    return filter ? [filter] : undefined;
}
