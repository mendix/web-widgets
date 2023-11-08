import { DefaultFilterEnum } from "../../typings/DatagridNumberFilterProps";
import { Big } from "big.js";
import { InitialFilterProps } from "@mendix/widget-plugin-filtering";

export type DefaultFilterValue = {
    type: DefaultFilterEnum;
    value: Big;
};

export function translateFilters(filters?: InitialFilterProps[]): DefaultFilterValue | undefined {
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

        return {
            type,
            value: ensureBig(filter.value)
        };
    }
    return undefined;
}

function ensureBig(value: unknown): Big {
    if (value instanceof Big) {
        return value;
    }
    throw new Error(`Datagrid Number Filter: filter value doesn't match filter type: ${value}`);
}
