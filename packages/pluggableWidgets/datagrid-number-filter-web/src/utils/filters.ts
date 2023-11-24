import { DefaultFilterEnum } from "../../typings/DatagridNumberFilterProps";
import { Big } from "big.js";
import { InitialFilterValue } from "@mendix/widget-plugin-filtering";

export type DefaultFilterValue = {
    type: DefaultFilterEnum;
    value: Big;
};

export function translateFilters(filters?: InitialFilterValue[]): DefaultFilterValue | undefined {
    if (filters && filters.length === 1) {
        const [filter] = filters;
        let type: DefaultFilterEnum = "equal";
        switch (filter.type) {
            case ">":
                type = "greater";
                break;
            case ">=":
                type = "greaterEqual";
                break;
            case "=":
                type = "equal";
                break;
            case "!=":
                type = "notEqual";
                break;
            case "<":
                type = "smaller";
                break;
            case "<=":
                type = "smallerEqual";
                break;
        }
        if (filter.value instanceof Big) {
            return {
                type,
                value: filter.value
            };
        }
    }
    return undefined;
}
