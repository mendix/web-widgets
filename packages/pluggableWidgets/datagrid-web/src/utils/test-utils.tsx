import { createElement } from "react";
import { GUID, ObjectItem } from "mendix";
import { dynamicValue, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { WidgetProps } from "../components/Widget";
import { ColumnsType } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { ColumnId, GridColumn } from "../typings/GridColumn";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { PositionController } from "@mendix/widget-plugin-grid/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import { ColumnStore } from "../helpers/state/column/ColumnStore";
import { IColumnParentStore } from "../helpers/state/ColumnGroupStore";

export const column = (header = "Test", patch?: (col: ColumnsType) => void): ColumnsType => {
    const c: ColumnsType = {
        alignment: "left" as const,
        attribute: listAttr(() => "Attr value"),
        dynamicText: listExp(() => "Dynamic text"),
        draggable: false,
        header: dynamicValue(header),
        hidable: "no" as const,
        resizable: false,
        showContentAs: "attribute",
        size: 1,
        sortable: false,
        width: "autoFill" as const,
        wrapText: false,
        visible: dynamicValue(true),
        minWidth: "auto",
        minWidthLimit: 100,
        allowEventPropagation: true,
        fetchOptionsLazy: true,
        filterCaptionType: "attribute"
    };

    if (patch) {
        patch(c);
    }

    return c;
};

export function mockSelectionProps(patch?: (props: SelectActionHelper) => SelectActionHelper): SelectActionHelper {
    const props = new SelectActionHelper("None", undefined, "checkbox", false, 5, "clear");

    if (patch) {
        patch(props);
    }

    return props;
}

export function mockGridColumn(c: ColumnsType, index: number): GridColumn {
    const parentStore: IColumnParentStore = {
        isLastVisible(_column: ColumnStore): boolean {
            return false;
        },
        isResizing: false,
        sorting: {
            getDirection(_columnId: ColumnId): ["asc" | "desc", number] | undefined {
                return undefined;
            },
            toggleSort(_columnId: ColumnId): void {
                return undefined;
            }
        }
    };

    return new ColumnStore(index, c, parentStore);
}

export function mockWidgetProps(): WidgetProps<GridColumn, ObjectItem> {
    const id = "dg1";
    const columnsProp = [column("Test")];
    const columns = columnsProp.map((col, index) => mockGridColumn(col, index));

    return {
        CellComponent: Cell,
        className: "test",
        columnsDraggable: false,
        columnsFilterable: false,
        columnsHidable: false,
        columnsResizable: false,
        columnsSortable: false,
        data: [{ id: "123456" as GUID }],
        exporting: false,
        filterRenderer: () => <input type="text" defaultValue="dummy" />,
        hasMoreItems: false,
        headerWrapperRenderer: (_index, header) => header,
        id,
        onExportCancel: jest.fn(),
        page: 1,
        pageSize: 10,
        paginationType: "buttons",
        paging: false,
        pagingPosition: "bottom",
        showPagingButtons: "auto",
        visibleColumns: columns,
        availableColumns: columns,
        columnsSwap: jest.fn(),
        setIsResizing: jest.fn(),
        selectionStatus: "unknown",
        setPage: jest.fn(),
        processedRows: 0,
        gridInteractive: false,
        selectActionHelper: mockSelectionProps(),
        cellEventsController: { getProps: () => Object.create({}) },
        checkboxEventsController: { getProps: () => Object.create({}) },
        isLoading: false,
        isFetchingNextBatch: false,
        loadingType: "spinner",
        columnsLoading: false,
        focusController: new FocusTargetController(
            new PositionController(),
            new VirtualGridLayout(1, columns.length, 10)
        )
    };
}
