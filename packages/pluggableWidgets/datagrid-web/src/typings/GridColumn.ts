import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { AlignmentEnum } from "../../typings/DatagridProps";

export type ColumnId = string & { __columnIdTag: never };

/**
 * A generic column type for data grid.
 */
export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;
    canResize: boolean;
    canSort: boolean;
    columnClass(item: ObjectItem): string | undefined;
    columnId: ColumnId;
    columnNumber: number;
    header: string;
    initiallyHidden: boolean;
    renderCellContent: (item: ObjectItem) => ReactElement;
    isAvailable: boolean;
    wrapText: boolean;
    getCssWidth(): string;

    // hiding
    canHide: boolean;
    isHidden: boolean;
    toggleHidden(): void;
}
