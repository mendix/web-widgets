import { dynamic, list, listAttribute, listExpression } from "@mendix/widget-plugin-test-utils";
import { ColumnsType, DatagridContainerProps, Translations } from "../../typings/DatagridProps";
import { ColumnStore } from "../helpers/state/column/ColumnStore";
import { IColumnParentStore } from "../helpers/state/ColumnGroupStore";
import { ColumnId, GridColumn } from "../typings/GridColumn";

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

/** English defaults of the Data Grid system texts, as declared in Datagrid.xml. */
export const defaultSystemTexts: { [K in keyof Translations]: string } = {
    filterSectionTitle: "Filters",
    exportDialogLabel: "Export progress",
    cancelExportLabel: "Cancel data export",
    selectRowLabel: "Select row",
    selectAllRowsLabel: "Select all rows",
    singleSelectionColumnLabel: "Select single row",
    selectingAllLabel: "Selecting all items...",
    cancelSelectionLabel: "Cancel selection"
};

/** Mock of the `texts` prop that the Mendix runtime passes for system texts. */
export function mockTexts(overrides?: Partial<typeof defaultSystemTexts>): DatagridContainerProps["texts"] {
    const texts = { ...defaultSystemTexts, ...overrides };
    return {
        translate: (key, ..._params) => texts[key]
    };
}

export function mockContainerProps(overrides?: Partial<DatagridContainerProps>): DatagridContainerProps {
    return {
        class: "dg-one",
        name: "datagrid2_1",
        texts: mockTexts(),
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
