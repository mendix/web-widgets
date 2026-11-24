import { dynamic, list, listAttribute, listExpression } from "@mendix/widget-plugin-test-utils";
import { ColumnsType, DatagridContainerProps } from "../../typings/DatagridProps";
import { IColumnParentStore } from "../features/columns/ColumnGroupStore";
import { ColumnStore } from "../features/columns/ColumnStore";
import { GridColumn } from "../features/columns/GridColumn";
import { ColumnsSortingStore } from "../features/sorting/ColumnsSortingStore";

export const column = (header = "Test", patch?: (col: ColumnsType) => void): ColumnsType => {
    const c: ColumnsType = {
        alignment: "left" as const,
        attribute: listAttribute(() => "Attr value"),
        dynamicText: listExpression(() => "Dynamic text"),
        draggable: false,
        header: dynamic.available(header),
        hidable: "no" as const,
        resizable: false,
        showContentAs: "attribute",
        size: 1,
        sortable: false,
        width: "autoFill" as const,
        wrapText: false,
        visible: dynamic.available(true),
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

export function mockGridColumn(c: ColumnsType, index: number): GridColumn {
    const parentStore: IColumnParentStore = {
        isLastVisible(_column: ColumnStore): boolean {
            return false;
        },
        isResizing: false,
        sorting: new ColumnsSortingStore([])
    };

    return new ColumnStore(index, c, parentStore);
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
        autoSelect: false,
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
        selectAllText: dynamic.available("Select all items"),
        selectAllTemplate: dynamic.available("Select all %d items"),
        allSelectedText: dynamic.available("All items selected"),
        useCustomPagination: false,
        customPagination: undefined,
        ...overrides
    };
}
