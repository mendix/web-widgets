import { ObjectItem } from "mendix";
import { createContext, Provider, useContext } from "react";
import { GridColumn } from "../typings/GridColumn";
import { TableProps } from "../components/Table";

const NO_PROPS_VALUE = Symbol("NO_PROPS_VALUE");

type Props = TableProps<GridColumn, ObjectItem>;
type ContextValue = typeof NO_PROPS_VALUE | Props;

const context = createContext<ContextValue>(NO_PROPS_VALUE);

export const QuickAccessProvider: Provider<ContextValue> = context.Provider;

export function useGridProps(): Props {
    const value = useContext(context);

    if (value === NO_PROPS_VALUE) {
        throw new Error("useTableProps: failed to get value from props provider.");
    }

    return value;
}
