import { createElement } from "react";
import { GUID, ObjectItem } from "mendix";
import { dynamicValue, list, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { WidgetProps } from "../components/Widget";
import { ColumnsType } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { GridColumn } from "../typings/GridColumn";
import { Column } from "../helpers/Column";
import { initGridState } from "../features/model/use-grid-state";
import { paramsFromColumns } from "../features/model/utils";
import * as Grid from "../typings/GridModel";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { PositionController } from "@mendix/widget-plugin-grid/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import { Actions, State } from "../typings/GridModel";

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
        minWidthLimit: 100
    };

    if (patch) {
        patch(c);
    }

    return c;
};

export function mockSelectionProps(patch?: (props: SelectActionHelper) => SelectActionHelper): SelectActionHelper {
    const props = new SelectActionHelper("None", undefined, "checkbox", false, 5);

    if (patch) {
        patch(props);
    }

    return props;
}

export function mockState(columns: Column[]): Grid.State {
    const state = initGridState({
        params: paramsFromColumns(columns, list(0)),
        columns
    });

    columns.forEach(c =>
        c.unstable_setStateAndActions(state as State, { setColumnElement: jest.fn() } as unknown as Actions)
    );

    return state;
}

export function mockWidgetProps(): WidgetProps<GridColumn, ObjectItem> {
    const id = "dg1";
    const columnsProp = [column("Test")];
    const columns = columnsProp.map((col, index) => new Column(col, index));
    const state = mockState(columns);

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
        visibleColumns: state.visibleColumns,
        availableColumns: state.availableColumns,
        actions: {
            setFilter: jest.fn(),
            swap: jest.fn(),
            setSize: jest.fn(),
            createSizeSnapshot: jest.fn()
        },
        selectionStatus: "unknown",
        setPage: jest.fn(),
        processedRows: 0,
        rowClickable: false,
        selectActionHelper: mockSelectionProps(),
        cellEventsController: { getProps: () => Object.create({}) },
        checkboxEventsController: { getProps: () => Object.create({}) },
        focusController: new FocusTargetController(
            new PositionController(),
            new VirtualGridLayout(1, columns.length, 10)
        )
    };
}
