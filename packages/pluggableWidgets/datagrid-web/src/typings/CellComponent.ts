import { ObjectItem } from "mendix";
import { DOMAttributes, ReactElement, ReactNode } from "react";
import { GridColumn } from "./GridColumn";

export interface CellComponentProps<C extends GridColumn> {
    children?: ReactNode;
    className?: string;
    column: C;
    item: ObjectItem;
    key?: string | number;
    rowIndex: number;
    columnIndex?: number;
    onClick?: DOMAttributes<HTMLDivElement>["onClick"];
    onKeyDown?: DOMAttributes<HTMLDivElement>["onKeyDown"];
    clickable?: boolean;
    preview?: boolean;
}

export type CellComponent<C extends GridColumn> = (props: CellComponentProps<C>) => ReactElement;
