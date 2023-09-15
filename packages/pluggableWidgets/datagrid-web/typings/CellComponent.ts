import { ReactNode, ReactElement } from "react";
import { ObjectItem, ListActionValue } from "mendix";
import { Column } from "./Column";

type ClickActions = "selectRow" | "executeAction";

export interface CellComponentProps<C extends Column> {
    children?: ReactNode;
    className?: string;
    column: C;
    item: ObjectItem;
    key?: string | number;
    rowIndex: number;
    columnIndex?: number;
    cellClickActAs: ClickActions;
    onSelect?: (item: ObjectItem) => void;
    rowAction?: ListActionValue;
}

export type CellComponent<C extends Column> = (props: CellComponentProps<C>) => ReactElement;
