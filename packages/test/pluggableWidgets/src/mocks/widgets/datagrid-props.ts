import type { DatagridContainerProps, ColumnsType } from "@mendix/datagrid-web/typings/DatagridProps";
import { ObjectItem } from "../mendix";
import {
    createDynamicValue,
    createEditableValue,
    createListValue,
    createListAttributeValue,
    createListExpressionValue,
    createMockObjectItem
} from "../widget-tools";
import {
    createMockDataGridTextFilterProps,
    createMockDataGridTextFilterPropsStrict
} from "./datagrid-text-filter-props";
import { createElement, lazy } from "react";

// Lazy load the DataGrid text filter component
const DatagridTextFilter = lazy(() => import("@mendix/datagrid-text-filter-web/src/DatagridTextFilter"));

export function createMockDataGridProps(): any {
    // Create fresh mock data items for each call
    const mockDataItem1: ObjectItem = createMockObjectItem("data1");
    const mockDataItem2: ObjectItem = createMockObjectItem("data2");
    const mockDataItem3: ObjectItem = createMockObjectItem("data3");
    const mockDataItem4: ObjectItem = createMockObjectItem("data4");
    const mockDataItem5: ObjectItem = createMockObjectItem("data5");

    // Define properly typed column configurations with text filters
    const columns: any[] = [
        {
            showContentAs: "attribute",
            attribute: createListAttributeValue({
                id: "attr_id_mock",
                sortable: true,
                filterable: true,
                formatter: {},
                type: "String",
                isList: false
            }),
            content: undefined,
            dynamicText: undefined,
            exportValue: undefined,
            header: createDynamicValue("ID"),
            tooltip: undefined,
            filter: createElement(DatagridTextFilter, {
                ...createMockDataGridTextFilterPropsStrict(),
                name: "idFilter",
                placeholder: createDynamicValue("Filter by ID...") as any
            }),
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
            showContentAs: "attribute",
            attribute: createListAttributeValue({
                id: "attr_name_mock",
                sortable: true,
                filterable: true,
                formatter: {},
                type: "String",
                isList: false
            }),
            content: undefined,
            dynamicText: undefined,
            exportValue: undefined,
            header: createDynamicValue("Name"),
            tooltip: undefined,
            filter: createElement(DatagridTextFilter, {
                ...createMockDataGridTextFilterProps(),
                name: "nameFilter",
                placeholder: createDynamicValue("Filter by name...") as any,
                defaultFilter: "contains"
            }),
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
    ];

    return {
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

        // Column definitions - properly typed
        columns,

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
}

// Second DataGrid variant with different configuration
export function createMockDataGridPropsCompact(): any {
    // Create fresh mock data items for each call - different data for variant
    const mockDataItem1: ObjectItem = createMockObjectItem("compact1");
    const mockDataItem2: ObjectItem = createMockObjectItem("compact2");
    const mockDataItem3: ObjectItem = createMockObjectItem("compact3");

    // Define a more compact column configuration
    const columns: any[] = [
        {
            showContentAs: "dynamicText",
            attribute: undefined,
            content: undefined,
            dynamicText: createListExpressionValue<string>("Item " + "$currentObject/id"),
            exportValue: undefined,
            header: createDynamicValue("Item"),
            tooltip: undefined,
            filter: undefined,
            visible: createDynamicValue(true),
            sortable: true,
            resizable: false,
            draggable: false,
            hidable: "no",
            allowEventPropagation: true,
            width: "manual",
            minWidth: "manual",
            minWidthLimit: 120,
            size: 150,
            alignment: "left",
            columnClass: undefined,
            wrapText: false
        },
        {
            showContentAs: "dynamicText",
            attribute: undefined,
            content: undefined,
            dynamicText: createListExpressionValue<string>("✓"),
            exportValue: undefined,
            header: createDynamicValue("✓"),
            tooltip: undefined,
            filter: undefined,
            visible: createDynamicValue(true),
            sortable: false,
            resizable: false,
            draggable: false,
            hidable: "no",
            allowEventPropagation: true,
            width: "manual",
            minWidth: "manual",
            minWidthLimit: 50,
            size: 60,
            alignment: "center",
            columnClass: undefined,
            wrapText: false
        }
    ];

    return {
        name: "dataGridCompact",
        class: "mx-datagrid mx-datagrid-compact",
        tabIndex: 0,

        // Core configuration - simpler setup
        advanced: false,
        datasource: createListValue([mockDataItem1, mockDataItem2, mockDataItem3]),
        refreshInterval: 0,

        // Selection configuration - enabled for this variant
        itemSelection: undefined,
        itemSelectionMethod: "radioButton",
        itemSelectionMode: "clear",
        showSelectAllToggle: false,

        // Loading and display - minimal
        loadingType: "text",
        refreshIndicator: false,

        // Column definitions - compact setup
        columns,

        // Column features - minimal
        columnsFilterable: false,
        columnsSortable: true,
        columnsResizable: false,
        columnsDraggable: false,
        columnsHidable: false,

        // Pagination - simplified
        pageSize: 5,
        pagination: "simple",
        showPagingButtons: "auto",
        showNumberOfRows: false,
        pagingPosition: "bottom",
        loadMoreButtonCaption: createDynamicValue("More..."),

        // Empty state
        showEmptyPlaceholder: "default",
        emptyPlaceholder: undefined,

        // Row styling and interactions
        rowClass: undefined,
        onClickTrigger: "double",
        onClick: undefined,
        onSelectionChange: undefined,

        // Filters
        filtersPlaceholder: undefined,

        // Configuration storage
        configurationStorageType: "none",
        configurationAttribute: undefined,
        storeFiltersInPersonalization: false,

        // Accessibility labels
        filterSectionTitle: createDynamicValue("Filter"),
        exportDialogLabel: createDynamicValue("Export"),
        cancelExportLabel: createDynamicValue("Cancel"),
        selectRowLabel: createDynamicValue("Select"),
        selectAllRowsLabel: createDynamicValue("Select all")
    };
}

// Keep the old export for backward compatibility (deprecated)
export const mockDataGridProps = createMockDataGridProps();
