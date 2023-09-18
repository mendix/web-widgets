import { createElement } from "react";
import { GUID, ObjectItem } from "mendix";
import { dynamicValue, listAttr, listExp } from "@mendix/widget-plugin-test-utils";
import { TableProps } from "../components/Table";
import { ColumnsType } from "../../typings/DatagridProps";
import { Cell } from "../components/Cell";
import { fromColumnsType } from "../models/GridColumn";

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

export function mockTableProps(): TableProps<ColumnsType, ObjectItem> {
    const columns = [column("Test")];

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
        columns,
        gridColumns: columns.map(fromColumnsType),
        valueForSort: () => "dummy",
        filterRenderer: () => <input type="text" defaultValue="dummy" />,
        headerWrapperRenderer: (_index, header) => header,
        data: [{ id: "123456" as GUID }],
        onSelect: jest.fn(),
        onSelectAll: jest.fn(),
        isSelected: jest.fn(() => false),
        selectionMethod: "none",
        selectionStatus: undefined,
        id: "dg1"
    };
}
