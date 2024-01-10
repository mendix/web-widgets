import { createElement } from "react";
import { GUID, ObjectItem } from "mendix";
import { dynamicValue, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { WidgetProps } from "../components/Widget";
import { ColumnsType } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { GridColumn } from "../typings/GridColumn";
import { Column } from "../helpers/Column";
import { initColumnsState } from "../features/use-columns-state";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { FocusTargetController } from "../features/keyboard-navigation/FocusTargetController";
import { PositionController } from "../features/keyboard-navigation/PositionController";
import { VirtualGridLayout } from "../features/keyboard-navigation/VirtualGridLayout";

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

export function mockSelectionProps(patch?: (props: SelectActionHelper) => SelectActionHelper): SelectActionHelper {
    const props = new SelectActionHelper("None", undefined, "checkbox", false, 5);

    if (patch) {
        patch(props);
    }

    return props;
}

export function mockWidgetProps(): WidgetProps<GridColumn, ObjectItem> {
    const id = "dg1";
    const columnsProp = [column("Test")];
    const columns = columnsProp.map((col, index) => new Column(col, index, id));
    const columnsState = initColumnsState(columns);

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
        columnsState,
        setHidden: jest.fn(),
        setOrder: jest.fn(),
        valueForSort: () => "dummy",
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
