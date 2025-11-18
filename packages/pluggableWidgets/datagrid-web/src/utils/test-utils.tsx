import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { PositionController } from "@mendix/widget-plugin-grid/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import { dynamic, list, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { GUID, ObjectItem } from "mendix";
import { ColumnsType, DatagridContainerProps } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { WidgetProps } from "../components/Widget";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { ColumnStore } from "../helpers/state/column/ColumnStore";
import { IColumnParentStore } from "../helpers/state/ColumnGroupStore";
import { ColumnId, GridColumn } from "../typings/GridColumn";

export const column = (header = "Test", patch?: (col: ColumnsType) => void): ColumnsType => {
    const c: ColumnsType = {
        alignment: "left" as const,
        attribute: listAttr(() => "Attr value"),
        dynamicText: listExp(() => "Dynamic text"),
        draggable: false,
        header: dynamic(header),
        hidable: "no" as const,
        resizable: false,
        showContentAs: "attribute",
        size: 1,
        sortable: false,
        width: "autoFill" as const,
        wrapText: false,
        visible: dynamic(true),
        minWidth: "auto",
        minWidthLimit: 100,
        allowEventPropagation: true,
        exportType: "default"
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
        headerWrapperRenderer: (_index, header) => header,
        id,
        onExportCancel: jest.fn(),
        paginationType: "buttons",
        visibleColumns: columns,
        availableColumns: columns,
        columnsSwap: jest.fn(),
        setIsResizing: jest.fn(),
        processedRows: 0,
        selectActionHelper: mockSelectionProps(),
        cellEventsController: { getProps: () => Object.create({}) },
        checkboxEventsController: { getProps: () => Object.create({}) },
        isFirstLoad: false,
        isFetchingNextBatch: false,
        loadingType: "spinner",
        columnsLoading: false,
        showRefreshIndicator: false,
        focusController: new FocusTargetController(
            new PositionController(),
            new VirtualGridLayout(1, columns.length, 10)
        )
    };
}

export function mockContainerProps(overrides?: Partial<DatagridContainerProps>): DatagridContainerProps {
    return {
        class: "dg-one",
        name: "datagrid2_1",
        datasource: list(5),
        refreshInterval: 0,
        columnsFilterable: true,
        columnsSortable: true,
        columnsDraggable: true,
        columnsHidable: true,
        columnsResizable: true,
        columns: [column("Col1"), column("Col2")],
        itemSelectionMethod: "checkbox",
        itemSelectionMode: "clear",
        enableSelectAll: false,
        keepSelection: false,
        showSelectAllToggle: true,
        pageSize: 10,
        selectionCounterPosition: "bottom",
        pagination: "buttons",
        refreshIndicator: false,
        loadingType: "spinner",
        showPagingButtons: "auto",
        pagingPosition: "bottom",
        onClickTrigger: "single",
        showNumberOfRows: false,
        showEmptyPlaceholder: "none",
        configurationStorageType: "attribute",
        configurationAttribute: undefined,
        storeFiltersInPersonalization: true,
        selectAllText: dynamic("Select all items"),
        selectAllTemplate: dynamic("Select all %d items"),
        allSelectedText: dynamic("All items selected"),
        ...overrides
    };
}
