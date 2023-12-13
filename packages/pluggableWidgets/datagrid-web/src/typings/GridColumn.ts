import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { AlignmentEnum, WidthEnum } from "../../typings/DatagridProps";

/**
 * A generic column type for data grid.
 */
export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    canSort: boolean;
    columnClass(item: ObjectItem): string | undefined;
    columnId: string;
    columnNumber: number;
    header: string;
    initiallyHidden: boolean;
    renderCellContent: (item: ObjectItem) => ReactElement;
    visible: boolean;
    weight: number;
    width: WidthEnum;
    wrapText: boolean;
}
