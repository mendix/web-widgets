import type { DatagridContainerProps } from "@mendix/datagrid-web/typings/DatagridProps";
import { ObjectItem } from "../mendix";
import {
    createDynamicValue,
    createEditableValue,
    createListValue,
    createListAttributeValue,
    createListExpressionValue,
    createMockObjectItem
} from "../widget-tools";

// Mock object items for DataGrid rows
const mockDataItem1: ObjectItem = createMockObjectItem("data1");
const mockDataItem2: ObjectItem = createMockObjectItem("data2");
const mockDataItem3: ObjectItem = createMockObjectItem("data3");
const mockDataItem4: ObjectItem = createMockObjectItem("data4");
const mockDataItem5: ObjectItem = createMockObjectItem("data5");

export const mockDataGridProps: any = {
    name: "dataGrid",
    class: "mx-datagrid",
    tabIndex: 0,

    // Core configuration
    advanced: false,
    datasource: createListValue([mockDataItem1, mockDataItem2, mockDataItem3, mockDataItem4, mockDataItem5]),
    refreshInterval: 0,

    // Selection configuration
    itemSelection: undefined, // No selection for basic demo
    itemSelectionMethod: "checkbox",
    itemSelectionMode: "toggle",
    showSelectAllToggle: true,

    // Loading and display
    loadingType: "spinner",
    refreshIndicator: true,

    // Column definitions - simplified for demo
    columns: [
        {
            showContentAs: "dynamicText",
            attribute: undefined,
            content: undefined,
            dynamicText: createListExpressionValue<string>("ID: " + "$currentObject/id"),
            exportValue: undefined,
            header: createDynamicValue("ID"),
            tooltip: undefined,
            filter: undefined,
            visible: createDynamicValue(true),
            sortable: true,
            resizable: true,
            draggable: false,
            hidable: "yes",
            allowEventPropagation: true,
            width: "autoFit",
            minWidth: "auto",
            minWidthLimit: 100,
            size: 150,
            alignment: "left",
            columnClass: undefined,
            wrapText: false
        },
        {
            showContentAs: "dynamicText",
            attribute: undefined,
            content: undefined,
            dynamicText: createListExpressionValue<string>("Name: Mock Item " + "$currentObject/id"),
            exportValue: undefined,
            header: createDynamicValue("Name"),
            tooltip: undefined,
            filter: undefined,
            visible: createDynamicValue(true),
            sortable: true,
            resizable: true,
            draggable: false,
            hidable: "yes",
            allowEventPropagation: true,
            width: "autoFill",
            minWidth: "auto",
            minWidthLimit: 120,
            size: 200,
            alignment: "left",
            columnClass: undefined,
            wrapText: true
        },
        {
            showContentAs: "dynamicText",
            attribute: undefined,
            content: undefined,
            dynamicText: createListExpressionValue<string>("Active"),
            exportValue: undefined,
            header: createDynamicValue("Status"),
            tooltip: undefined,
            filter: undefined,
            visible: createDynamicValue(true),
            sortable: true,
            resizable: true,
            draggable: false,
            hidable: "yes",
            allowEventPropagation: true,
            width: "manual",
            minWidth: "manual",
            minWidthLimit: 100,
            size: 120,
            alignment: "center",
            columnClass: undefined,
            wrapText: false
        }
    ],

    // Column features
    columnsFilterable: true,
    columnsSortable: true,
    columnsResizable: true,
    columnsDraggable: false,
    columnsHidable: true,

    // Pagination
    pageSize: 10,
    pagination: "buttons",
    showPagingButtons: "auto",
    showNumberOfRows: true,
    pagingPosition: "bottom",
    loadMoreButtonCaption: createDynamicValue("Load more..."),

    // Empty state
    showEmptyPlaceholder: "custom",
    emptyPlaceholder: undefined,

    // Row styling and interactions
    rowClass: undefined,
    onClickTrigger: "single",
    onClick: undefined,
    onSelectionChange: undefined,

    // Filters
    filtersPlaceholder: undefined,

    // Configuration storage
    configurationStorageType: "localStorage",
    configurationAttribute: undefined,
    storeFiltersInPersonalization: false,

    // Accessibility labels
    filterSectionTitle: createDynamicValue("Filters"),
    exportDialogLabel: createDynamicValue("Export Data"),
    cancelExportLabel: createDynamicValue("Cancel"),
    selectRowLabel: createDynamicValue("Select row"),
    selectAllRowsLabel: createDynamicValue("Select all rows")
};

// Alternative: DataGrid with selection enabled
export const mockDataGridWithSelectionProps: any = {
    ...mockDataGridProps,
    name: "dataGridWithSelection",

    // Enable multi-selection
    itemSelection: undefined, // This would need to be properly mocked for selection to work
    itemSelectionMethod: "checkbox",
    itemSelectionMode: "toggle",
    showSelectAllToggle: true,

    // Add selection change handler
    onSelectionChange: undefined,

    // Make it more interactive
    onClick: undefined,
    onClickTrigger: "single"
};

// Alternative: DataGrid with virtual scrolling
export const mockDataGridVirtualScrollingProps: any = {
    ...mockDataGridProps,
    name: "dataGridVirtualScrolling",

    // Virtual scrolling configuration
    pagination: "virtualScrolling",
    pageSize: 25,
    showPagingButtons: "always",
    showNumberOfRows: true,
    pagingPosition: "bottom"
};
