import { FilterContextValue, FilterState, readInitFilterProps } from "@mendix/widget-plugin-filtering";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { createElement, useMemo } from "react";
import { useFilterContextProvider } from "./useFilterContextProvider";
import { useOnce } from "./utils";

type Props = React.PropsWithChildren<{
    index: number;
    dispatch: (value: FilterState, index: number) => void;
    attribute: ListAttributeValue;
    datasourceFilter: FilterCondition | undefined;
}>;

export function SingleAttrFilteringProvider({
    attribute,
    children,
    datasourceFilter,
    dispatch,
    index
}: Props): React.ReactElement | null {
    const Provider = useFilterContextProvider();

    const initProps = useOnce(() => readInitFilterProps(attribute, datasourceFilter));

    const contextValue = useMemo<FilterContextValue>(
        () => ({
            filterDispatcher: value => dispatch(value, index),
            singleAttribute: attribute,
            singleInitialFilter: initProps
        }),
        [dispatch, attribute, initProps, index]
    );

    return <Provider value={contextValue}>{children}</Provider>;
}
