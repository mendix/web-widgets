import { createElement } from "react";
import { GUID, ObjectItem } from "mendix";
import { dynamicValue, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { TableProps } from "../components/Table";
import { ColumnsType } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { GridColumn } from "../typings/GridColumn";
import { Column } from "../helpers/Column";
import { GridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";

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
        wrapText: false
    };

    if (patch) {
        patch(c);
    }

    return c;
};

export function mockTableProps(): TableProps<GridColumn, ObjectItem> {
    const id = "dg1";
    const columnsProp = [column("Test")];

    const selectionProps: GridSelectionProps = {
        selectionType: "None",
        selectionMethod: "checkbox",
        multiselectable: undefined,
        showCheckboxColumn: false,
        showSelectAllToggle: false,
        onSelect: jest.fn(),
        onSelectAll: jest.fn(),
        isSelected: jest.fn(() => false)
    };

    return {
        CellComponent: Cell,
        setPage: jest.fn(),
        page: 1,
        hasMoreItems: false,
        pageSize: 10,
        columnsResizable: false,
        paging: false,
        pagingPosition: "bottom",
        columnsHidable: false,
        columnsDraggable: false,
        className: "test",
        columnsFilterable: false,
        columnsSortable: false,
        columns: columnsProp.map((col, index) => new Column(col, index, id)),
        valueForSort: () => "dummy",
        filterRenderer: () => <input type="text" defaultValue="dummy" />,
        headerWrapperRenderer: (_index, header) => header,
        data: [{ id: "123456" as GUID }],
        id,
        selectionProps
    };
}
