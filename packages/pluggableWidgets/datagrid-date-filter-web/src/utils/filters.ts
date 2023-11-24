import { InitialFilterValue } from "@mendix/widget-plugin-filtering";
import { DefaultFilterEnum } from "../../typings/DatagridDateFilterProps";

export type DefaultFilterValue = {
    type: DefaultFilterEnum;
    value?: Date;
    startDate?: Date;
    endDate?: Date;
};

export function translateFilters(filters?: InitialFilterValue[]): DefaultFilterValue | undefined {
    if (filters && filters.length > 0) {
        if (filters.length === 1) {
            const [filter] = filters;
            let type: DefaultFilterEnum = "greater";
            switch (filter.type) {
                case ">":
                    type = "greater";
                    break;
                case ">=":
                    type = "greaterEqual";
                    break;
                case "<":
                    type = "smaller";
                    break;
                case "<=":
                    type = "smallerEqual";
                    break;
            }

            return {
                type,
                value: ensureDate(filter.value)
            };
        } else {
            const [filterStart, filterEnd] = filters;
            let type: DefaultFilterEnum = "equal";
            if (filterStart.type === ">=" && filterEnd.type === "<") {
                type = "equal";
            } else if (filterStart.type === "<" && filterEnd.type === ">=") {
                type = "notEqual";
            } else if (filterStart.type === ">=" && filterEnd.type === "<=") {
                return {
                    type: "between",
                    startDate: ensureDate(filterStart.value),
                    endDate: ensureDate(filterEnd.value)
                };
            }
            return {
                type,
                value: ensureDate(filterStart.value)
            };
        }
    }
    return undefined;
}

function ensureDate(value: unknown): Date {
    if (!(value instanceof Date)) {
        throw Error("Invalid init filter value");
    }
    return value;
}
