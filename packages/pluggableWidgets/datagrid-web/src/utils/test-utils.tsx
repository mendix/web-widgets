import { createElement } from "react";
import { GUID, ObjectItem } from "mendix";
import { dynamicValue, list, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { WidgetProps } from "../components/Widget";
import { ColumnsType } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { GridColumn } from "../typings/GridColumn";
import { Column } from "../helpers/Column";
import { GridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { initGridState } from "../features/model/use-grid-state";
import { paramsFromColumns } from "../features/model/utils";
import * as Grid from "../typings/GridModel";

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
        visible: dynamicValue(true)
    };

    if (patch) {
        patch(c);
    }

    return c;
};

export function mockSelectionProps(patch?: (props: GridSelectionProps) => GridSelectionProps): GridSelectionProps {
    const props: GridSelectionProps = {
        isSelected: jest.fn(() => false),
        onSelect: jest.fn(),
        onSelectAll: jest.fn(),
        onSelectAdjacent: jest.fn(),
        selectionMethod: "checkbox",
        selectionType: "None",
        showCheckboxColumn: false,
        showSelectAllToggle: false
    };

    if (patch) {
        patch(props);
    }

    return props;
}

export function mockState(columns: Column[]): Grid.State {
    return initGridState({
        params: paramsFromColumns(columns, list(0)),
        columns
    });
}

export function mockWidgetProps(): WidgetProps<GridColumn, ObjectItem> {
    const id = "dg1";
    const columnsProp = [column("Test")];
    const columns = columnsProp.map((col, index) => new Column(col, index));
    const state = mockState(columns);
    const selectionProps = mockSelectionProps();

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
        paging: false,
        pagingPosition: "bottom",
        state,
        actions: {
            toggleHidden: jest.fn(),
            resize: jest.fn(),
            setFilter: jest.fn(),
            sortBy: jest.fn(),
            swap: jest.fn()
        },
        valueForSort: () => "dummy",
        selectionProps,
        selectionStatus: "unknown",
        setPage: jest.fn(),
        processedRows: 0
    };
}
