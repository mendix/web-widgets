import { render } from "enzyme";
import * as testingLibrary from "@testing-library/react";
import { GUID, ObjectItem } from "mendix";
import { createElement } from "react";
import { SelectionMethod } from "../../features/selection";
import { Table, TableProps } from "../Table";
import { objectItems } from "@mendix/pluggable-test-utils";
import "@testing-library/jest-dom";

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
                headerFilters={
                    <div className="my-custom-filters">
                        <span />
                    </div>
                }
                filtersTitle="filter title"
            />
        );

        expect(component).toMatchSnapshot();
    });

    describe("with selection method checkbox", () => {
        it("renders correctly and first column have checkboxes", () => {
            const { asFragment } = testingLibrary.render(
                <Table {...mockTableProps()} paging selectionMethod={SelectionMethod.checkbox} />
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("set negative tabindex on row checkbox", () => {
            const { getAllByRole } = testingLibrary.render(
                <Table {...mockTableProps()} paging selectionMethod={SelectionMethod.checkbox} />
            );

            getAllByRole("checkbox").forEach(elt => {
                expect(elt).toHaveAttribute("tabindex", "-1");
            });
        });

        it("render correct number of checked checkboxes", () => {
            const items = objectItems(6);
            const [a, b, c, d, e, f] = items;
            const { rerender } = testingLibrary.render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={SelectionMethod.checkbox} />
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
                    selectionMethod={SelectionMethod.checkbox}
                    isSelected={item => [a, b, c].includes(item)}
                />
            );

            expect(checked()).toHaveLength(3);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={SelectionMethod.checkbox}
                    isSelected={item => [c].includes(item)}
                />
            );

            expect(checked()).toHaveLength(1);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={SelectionMethod.checkbox}
                    isSelected={item => [d, e].includes(item)}
                />
            );

            expect(checked()).toHaveLength(2);

            rerender(
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={SelectionMethod.checkbox}
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
                <Table
                    {...mockTableProps()}
                    data={items}
                    paging
                    selectionMethod={SelectionMethod.checkbox}
                    onSelect={onSelect}
                />
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
                    selectionMethod={SelectionMethod.checkbox}
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
        selectionMethod: SelectionMethod.none,
        selectionStatus: undefined
    };
}
