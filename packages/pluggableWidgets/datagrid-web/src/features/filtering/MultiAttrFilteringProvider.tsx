import { DispatchFilterUpdate, FilterContextValue, readInitFilterProps } from "@mendix/widget-plugin-filtering";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { createElement, useMemo } from "react";
import { useFilterContextProvider } from "./useFilterContextProvider";
import { useOnce } from "./utils";

type Props = React.PropsWithChildren<{
    dispatch: DispatchFilterUpdate;
    attributeList: ListAttributeValue[];
    datasourceFilter: FilterCondition | undefined;
}>;

export function MultiAttrFilteringProvider({
    attributeList,
    children,
    datasourceFilter,
    dispatch
}: Props): React.ReactElement | null {
    const Provider = useFilterContextProvider();

    const initPropsMap = useOnce(() =>
        Object.fromEntries(attributeList.map(attr => [attr.id, readInitFilterProps(attr, datasourceFilter)]))
    );

    const contextValue = useMemo<FilterContextValue>(
        () => ({
            filterDispatcher: dispatch,
            multipleAttributes: Object.fromEntries(attributeList.map(attr => [attr.id, attr])),
            multipleInitialFilters: initPropsMap
        }),
        [dispatch, attributeList, initPropsMap]
    );

    return <Provider value={contextValue}>{children}</Provider>;
}
