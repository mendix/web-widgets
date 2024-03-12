import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { AlignmentEnum } from "../../typings/DatagridProps";
import { SortDirection } from "./sorting";

export type ColumnId = string & { __columnIdTag: never };

/**
 * A generic column type for data grid.
 */
export interface GridColumn {
    alignment: AlignmentEnum;
    canDrag: boolean;

    columnClass(item: ObjectItem): string | undefined;
    columnId: ColumnId;
    columnIndex: number;
    header: string;
    initiallyHidden: boolean;
    renderCellContent: (item: ObjectItem) => ReactElement;
    isAvailable: boolean;
    wrapText: boolean;

    // hiding
    canHide: boolean;
    isHidden: boolean;
    toggleHidden(): void;

    // sorting
    canSort: boolean;
    sortDir: SortDirection | undefined;
    toggleSort(): void;

    // sizing
    canResize: boolean;
    size: number | undefined;
    setSize(size: number): void;
    getCssWidth(): string;
    setHeaderElementRef(ref: HTMLDivElement | null): void;
}
