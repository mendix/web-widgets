import { ObjectItem } from "mendix";
import { ReactElement, ReactNode } from "react";
import { GridColumn } from "./GridColumn";
import { ElementProps } from "@mendix/widget-plugin-grid/event-switch/base";

export interface EventsController {
    getProps(item: ObjectItem): ElementProps<HTMLDivElement>;
}

export interface CellComponentProps<C extends GridColumn> {
    children?: ReactNode;
    className?: string;
    column: C;
    item: ObjectItem;
    key?: string | number;
    rowIndex: number;
    columnIndex?: number;
    clickable?: boolean;
    preview?: boolean;
    eventsController: EventsController;
}

export type CellComponent<C extends GridColumn> = (props: CellComponentProps<C>) => ReactElement;
