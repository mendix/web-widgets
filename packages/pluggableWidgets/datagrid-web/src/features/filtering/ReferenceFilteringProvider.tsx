import { FilterContextValue, FilterState } from "@mendix/widget-plugin-filtering";
import { createElement, useMemo } from "react";
import { ColumnsType } from "../../../typings/DatagridProps";
import { useFilterContextProvider } from "./useFilterContextProvider";
import { getAssociationProps } from "./utils";

type Props = React.PropsWithChildren<{
    index: number;
    dispatch: (value: FilterState, index: number) => void;
    column: ColumnsType;
}>;

export function ReferenceFilteringProvider({ dispatch, children, column, index }: Props): React.ReactElement | null {
    const Provider = useFilterContextProvider();

    const contextValue = useMemo<FilterContextValue>(
        () => ({
            filterDispatcher: value => dispatch(value, index),
            associationProperties: getAssociationProps(column)
        }),
        [dispatch, column, index]
    );

    return <Provider value={contextValue}>{children}</Provider>;
}
