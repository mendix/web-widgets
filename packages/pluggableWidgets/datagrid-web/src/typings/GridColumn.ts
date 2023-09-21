import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { AlignmentEnum, HidableEnum, WidthEnum } from "../../typings/DatagridProps";

/**
 * A generic column type for data grid.
 */
export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canHide: boolean;
    canResize: boolean;
    canSort: boolean;
    columnId: string;
    columnNumber: number;
    header: string;
    hidable: HidableEnum;
    hidden: boolean;
    weight: number;
    width: WidthEnum;
    renderCellContent: (item: ObjectItem) => ReactElement;
}
