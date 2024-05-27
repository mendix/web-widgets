import { useRef } from "react";
import { ListAttributeValue } from "mendix";
import { DispatchFilterUpdate, FilterContextValue, InitialFilterValue } from "@mendix/widget-plugin-filtering";
import { FilterTypeEnum, InitValues } from "../base-types";

export interface FilterAPIv2 {
    dispatch: DispatchFilterUpdate;
    initValues: InitValues | undefined;
    attributes: ListAttributeValue[];
    parentChannelName?: string;
}

export interface FilterAPIBox {
    current: FilterAPIv2;
}

export function useFilterAPIv2(ctx: FilterContextValue): FilterAPIBox {
    const prev = useRef<FilterAPIv2>();
    const value = (prev.current = mapContext(ctx, prev.current));
    const box = useRef(value);
    box.current = value;
    return box;
}

function mapContext(context: FilterContextValue, prev: FilterAPIv2 | undefined): FilterAPIv2 {
    return {
        dispatch: context.filterDispatcher,
        initValues: prev !== undefined ? prev.initValues : initValues(context),
        attributes: attributes(context),
        parentChannelName: context.eventsChannelName
    };
}

function initValues({ singleInitialFilter, multipleInitialFilters }: FilterContextValue): InitValues | undefined {
    const [multiInitialFilter = []] = Object.values(multipleInitialFilters ?? {});
    return translateFilters(singleInitialFilter ?? multiInitialFilter);
}

function attributes(ctx: FilterContextValue): ListAttributeValue[] {
    let attrs = ctx.singleAttribute ? [ctx.singleAttribute] : [];
    attrs = ctx.multipleAttributes ? attrs.concat(findAttributesByType(ctx.multipleAttributes)) : attrs;
    return attrs;
}

function findAttributesByType(multipleAttributes: { [key: string]: ListAttributeValue }): ListAttributeValue[] {
    return Object.keys(multipleAttributes)
        .map(key => multipleAttributes[key])
        .filter(attr => attr.type === "DateTime");
}

function translateFilters(filters: InitialFilterValue[]): InitValues | undefined {
    if (filters.length > 0) {
        if (filters.length === 1) {
            const [filter] = filters;
            let type: FilterTypeEnum = "greater";
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
                value: ensureDate(filter.value),
                startDate: null,
                endDate: null
            };
        } else {
            const [filterStart, filterEnd] = filters;
            let type: FilterTypeEnum = "equal";
            if (filterStart.type === ">=" && filterEnd.type === "<") {
                type = "equal";
            } else if (filterStart.type === "<" && filterEnd.type === ">=") {
                type = "notEqual";
            } else if (filterStart.type === ">=" && filterEnd.type === "<=") {
                return {
                    type: "between",
                    value: null,
                    startDate: ensureDate(filterStart.value),
                    endDate: ensureDate(filterEnd.value)
                };
            }
            return {
                type,
                value: ensureDate(filterStart.value),
                startDate: null,
                endDate: null
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
