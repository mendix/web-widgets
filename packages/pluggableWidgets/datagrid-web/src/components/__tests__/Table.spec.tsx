import { render } from "enzyme";
import * as testingLibrary from "@testing-library/react";
import { GUID, ObjectItem } from "mendix";
import { createElement } from "react";
import { Table, TableProps } from "../Table";
import { objectItems } from "@mendix/pluggable-test-utils";
import "@testing-library/jest-dom";
import { MultiSelectionStatus } from "@mendix/pluggable-widgets-commons";

describe("Table", () => {
    it("renders the structure correctly", () => {
        const component = render(<Table {...mockTableProps()} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with sorting", () => {
        const component = render(<Table {...mockTableProps()} columnsSortable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with resizing", () => {
        const component = render(<Table {...mockTableProps()} columnsResizable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with dragging", () => {
        const component = render(<Table {...mockTableProps()} columnsDraggable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with filtering", () => {
        const component = render(<Table {...mockTableProps()} columnsFilterable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with hiding", () => {
        const component = render(<Table {...mockTableProps()} columnsHidable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with paging", () => {
        const component = render(<Table {...mockTableProps()} paging />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with custom filtering", () => {
        const columns = [
            {
                header: "Test",
                hasWidgets: false,
                sortable: false,
                resizable: false,
                draggable: false,
                hidable: "no" as const,
                width: "autoFill" as const,
                size: 1,
                alignment: "left" as const,
                wrapText: false
            }
        ];
        const component = render(<Table {...mockTableProps()} columnsFilterable columns={columns} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with empty placeholder", () => {
        const component = render(
            <Table {...mockTableProps()} emptyPlaceholderRenderer={renderWrapper => renderWrapper(<div />)} />
        );

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with column alignments", () => {
        const columns = [
            {
                header: "Test",
                sortable: false,
                resizable: false,
                draggable: false,
                hidable: "no" as const,
                width: "autoFill" as const,
                size: 1,
                alignment: "center" as const,
                wrapText: false
            },
            {
                header: "Test 2",
                sortable: false,
                resizable: false,
                draggable: false,
                hidable: "no" as const,
                width: "autoFill" as const,
                size: 1,
                alignment: "right" as const,
                wrapText: false
            }
        ];

        const component = render(
            <Table
                {...mockTableProps()}
                columns={columns}
                cellRenderer={(renderWrapper, _, columnIndex) => renderWrapper(columns[columnIndex].header)}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with dynamic row class", () => {
        const component = render(<Table {...mockTableProps()} rowClass={() => "myclass"} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly for preview when no header is provided", () => {
        const columns = [
            {
                header: "",
                sortable: false,
                resizable: false,
                draggable: false,
                hidable: "no" as const,
                width: "autoFill" as const,
                size: 1,
                alignment: "center" as const,
                wrapText: false
            }
        ];
        const component = render(<Table {...mockTableProps()} preview columns={columns} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with header wrapper", () => {
        const component = render(
            <Table
                {...mockTableProps()}
                headerWrapperRenderer={(index, header) => (
                    <div key={`header_wrapper_${index}`} className="my-custom-header">
                        {header}
                    </div>
                )}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with header filters and a11y", () => {
        const component = render(
            <Table
                {...mockTableProps()}
                gridHeaderWidgets={
                    <div className="my-custom-filters">
                        <span />
                    </div>
                }
                gridHeaderTitle="filter title"
            />
        );

        expect(component).toMatchSnapshot();
    });

    describe("with selection method checkbox", () => {
        it("render method class", () => {
            const { render } = testingLibrary;
            const items = objectItems(3);

            const { container } = render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"checkbox"} />
            );

            expect(container.firstChild).toHaveClass("widget-datagrid-selection-method-checkbox");
        });

        it("render an extra column and add class to each selected cell", () => {
            const { render } = testingLibrary;
            const items = objectItems(3);

            const { asFragment } = render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"checkbox"} isSelected={() => true} />
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("set negative tabindex on row checkbox", () => {
            const { getAllByRole } = testingLibrary.render(
                <Table {...mockTableProps()} paging selectionMethod={"checkbox"} />
            );

            getAllByRole("checkbox").forEach(elt => {
                expect(elt).toHaveAttribute("tabindex", "-1");
            });
        });

        it("render correct number of checked checkboxes", () => {
            const items = objectItems(6);
            const [a, b, c, d, e, f] = items;
            const { rerender } = testingLibrary.render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"checkbox"} />
            );

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const checked = () =>
                testingLibrary.screen.getAllByRole<HTMLInputElement>("checkbox").filter(elt => elt.checked);

            expect(checked()).toHaveLength(0);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={"checkbox"}
                    isSelected={item => [a, b, c].includes(item)}
                />
            );

            expect(checked()).toHaveLength(3);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={"checkbox"}
                    isSelected={item => [c].includes(item)}
                />
            );

            expect(checked()).toHaveLength(1);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={"checkbox"}
                    isSelected={item => [d, e].includes(item)}
                />
            );

            expect(checked()).toHaveLength(2);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={"checkbox"}
                    isSelected={item => [f, e, d, a].includes(item)}
                />
            );

            expect(checked()).toHaveLength(4);
        });

        it("call onSelect when checkbox is clicked", () => {
            const { render, fireEvent, screen } = testingLibrary;
            const items = objectItems(3);
            const onSelect = jest.fn();

            render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"checkbox"} onSelect={onSelect} />
            );

            const checkbox1 = screen.getAllByRole("checkbox")[0];
            const checkbox3 = screen.getAllByRole("checkbox")[2];

            fireEvent.click(checkbox1);
            expect(onSelect).toBeCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);
            fireEvent.click(checkbox1);
            expect(onSelect).toBeCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);

            fireEvent.click(checkbox3);
            expect(onSelect).toBeCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[2]);
            fireEvent.click(checkbox3);
            expect(onSelect).toBeCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[2]);
        });
    });

    describe("with selection status", () => {
        it("not render header checkbox when status is undefined", () => {
            const { render, screen, queryByRole } = testingLibrary;
            const items = objectItems(5);
            render(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionStatus={undefined}
                    selectionMethod={"checkbox"}
                />
            );

            const colheader = screen.getAllByRole("columnheader")[0];
            expect(queryByRole(colheader, "checkbox")).toBeNull();
        });

        it("render header checkbox if status is given and checkbox state depends on the status", () => {
            const { render, screen, queryByRole, cleanup } = testingLibrary;
            const items = objectItems(5);
            const renderWithStatus = (status: MultiSelectionStatus): ReturnType<typeof render> =>
                render(
                    <Table
                        {...mockTableProps()}
                        data={items}
                        paging
                        selectionStatus={status}
                        selectionMethod={"checkbox"}
                    />
                );

            renderWithStatus("none");
            expect(queryByRole(screen.getAllByRole("columnheader")[0], "checkbox")).not.toBeChecked();

            cleanup();
            renderWithStatus("some");
            expect(queryByRole(screen.getAllByRole("columnheader")[0], "checkbox")).toBeChecked();

            cleanup();
            renderWithStatus("all");
            expect(queryByRole(screen.getAllByRole("columnheader")[0], "checkbox")).toBeChecked();
        });

        it("not render header checkbox if method is rowClick", () => {
            const { render, screen, queryByRole } = testingLibrary;
            const items = objectItems(5);
            render(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionStatus={"some"}
                    selectionMethod={"rowClick"}
                />
            );

            const colheader = screen.getAllByRole("columnheader")[0];
            expect(queryByRole(colheader, "checkbox")).toBeNull();
        });

        it("call onSelectAll when header checkbox is clicked", () => {
            const { render, fireEvent, screen } = testingLibrary;
            const items = objectItems(3);
            const onSelectAll = jest.fn();

            render(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionStatus="none"
                    selectionMethod={"checkbox"}
                    onSelectAll={onSelectAll}
                />
            );

            const checkbox = screen.getAllByRole("checkbox")[0];

            fireEvent.click(checkbox);
            expect(onSelectAll).toBeCalledTimes(1);

            fireEvent.click(checkbox);
            expect(onSelectAll).toBeCalledTimes(2);
        });
    });

    describe("with selection method rowClick", () => {
        it("render method class", () => {
            const { render } = testingLibrary;
            const items = objectItems(3);

            const { container } = render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"rowClick"} />
            );

            expect(container.firstChild).toHaveClass("widget-datagrid-selection-method-click");
        });

        it("add class to each selected cell", () => {
            const { render } = testingLibrary;
            const items = objectItems(3);

            const { asFragment } = render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"rowClick"} isSelected={() => true} />
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("call onSelect when cell is clicked", () => {
            const { render, screen, getAllByRole, fireEvent } = testingLibrary;
            const items = objectItems(3);
            const onSelect = jest.fn();
            const {
                columns: [columnProps],
                ...props
            } = mockTableProps();
            const col1 = { ...columnProps, header: "Column A" };
            const col2 = { ...columnProps, header: "Column B" };
            const columns = [col1, col2];

            render(
                <Table
                    {...props}
                    columns={columns}
                    data={items}
                    cellRenderer={(renderWrapper, _, columnIndex) => renderWrapper(columns[columnIndex].header)}
                    paging
                    selectionMethod={"rowClick"}
                    onSelect={onSelect}
                />
            );

            const rows = screen.getAllByRole("row").slice(1);
            expect(rows).toHaveLength(3);

            const [row1, row2] = rows;
            const [cell1, cell2] = getAllByRole(row1, "button");
            const [cell3, cell4] = getAllByRole(row2, "button");

            // Click cell1 two times
            fireEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);
            fireEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);

            // Click cell2
            fireEvent.click(cell2);
            expect(onSelect).toHaveBeenCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);

            // Click cell3 and cell4
            fireEvent.click(cell4);
            expect(onSelect).toHaveBeenCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[1]);
            fireEvent.click(cell3);
            expect(onSelect).toHaveBeenCalledTimes(5);
            expect(onSelect).toHaveBeenLastCalledWith(items[1]);
        });
    });
});

function mockTableProps(): TableProps<ObjectItem> {
    const columns = [
        {
            header: "Test",
            sortable: false,
            resizable: false,
            draggable: false,
            hidable: "no" as const,
            width: "autoFill" as const,
            size: 1,
            alignment: "left" as const,
            wrapText: false
        }
    ];
    return {
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
        valueForSort: () => "dummy",
        filterRenderer: () => <input type="text" defaultValue="dummy" />,
        cellRenderer: (renderWrapper, _, columnIndex) => renderWrapper(columns[columnIndex].header),
        headerWrapperRenderer: (_index, header) => header,
        data: [{ id: "123456" as GUID }],
        onSelect: jest.fn(),
        onSelectAll: jest.fn(),
        isSelected: jest.fn(() => false),
        selectionMethod: "none",
        selectionStatus: undefined
    };
}
