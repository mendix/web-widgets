import { render } from "enzyme";
import * as testingLibrary from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { Table } from "../Table";
import { listWidget, objectItems } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { MultiSelectionStatus } from "@mendix/widget-plugin-grid/selection";
import { column, mockTableProps } from "../../utils/test-utils";
import { fromColumnsType } from "../../models/GridColumn";

// you can also pass the mock implementation
// to jest.fn as an argument
window.IntersectionObserver = jest.fn(() => ({
    root: null,
    rootMargin: "",
    thresholds: [0, 1],
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
    takeRecords: jest.fn()
}));

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
        const columns = [column("Test")];
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
        const props = mockTableProps();
        props.columns = [column("Test"), column("Test 2")];
        props.gridColumns = props.columns.map(fromColumnsType);

        const component = render(<Table {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with dynamic row class", () => {
        const component = render(<Table {...mockTableProps()} rowClass={() => "myclass"} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly for preview when no header is provided", () => {
        const columns = [column("Test")];
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

        it("call onSelect when checkbox is clicked", async () => {
            const { render, screen } = testingLibrary;
            const items = objectItems(3);
            const onSelect = jest.fn();

            render(
                <Table {...mockTableProps()} data={items} paging selectionMethod={"checkbox"} onSelect={onSelect} />
            );

            const checkbox1 = screen.getAllByRole("checkbox")[0];
            const checkbox3 = screen.getAllByRole("checkbox")[2];

            await userEvent.click(checkbox1);
            expect(onSelect).toBeCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);
            await userEvent.click(checkbox1);
            expect(onSelect).toBeCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);

            await userEvent.click(checkbox3);
            expect(onSelect).toBeCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[2]);
            await userEvent.click(checkbox3);
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

        it("call onSelectAll when header checkbox is clicked", async () => {
            const { render, screen } = testingLibrary;
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

            await userEvent.click(checkbox);
            expect(onSelectAll).toBeCalledTimes(1);

            await userEvent.click(checkbox);
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

        it("call onSelect when cell is clicked", async () => {
            const { render, screen, getAllByRole } = testingLibrary;
            const items = objectItems(3);
            const onSelect = jest.fn();
            const props = mockTableProps();
            const columns = [column("Column A"), column("Column B")];

            props.columns = columns;
            props.gridColumns = columns.map(fromColumnsType);

            render(<Table {...props} data={items} paging selectionMethod={"rowClick"} onSelect={onSelect} />);

            const rows = screen.getAllByRole("row").slice(1);
            expect(rows).toHaveLength(3);

            const [row1, row2] = rows;
            const [cell1, cell2] = getAllByRole(row1, "button");
            const [cell3, cell4] = getAllByRole(row2, "button");

            // Click cell1 two times
            await userEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);
            await userEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);

            // Click cell2
            await userEvent.click(cell2);
            expect(onSelect).toHaveBeenCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[0]);

            // Click cell3 and cell4
            await userEvent.click(cell4);
            expect(onSelect).toHaveBeenCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[1]);
            await userEvent.click(cell3);
            expect(onSelect).toHaveBeenCalledTimes(5);
            expect(onSelect).toHaveBeenLastCalledWith(items[1]);
        });
    });

    describe("when has interactive element", () => {
        it("should not prevent default on keyboard input (space and Enter)", async () => {
            const { render, screen } = testingLibrary;
            const items = objectItems(3);

            const props = mockTableProps();
            const content = listWidget(() => <textarea />);
            const columns = Array.from(["Monday", "Tuesday", "Wednesday"], header => {
                const c = column(header);
                c.showContentAs = "customContent";
                c.content = content;
                return c;
            });

            props.columns = columns;
            props.gridColumns = columns.map(fromColumnsType);

            const user = userEvent.setup();

            render(<Table {...props} data={items} />);

            const [input] = screen.getAllByRole("textbox");
            await user.click(input);
            await user.keyboard("Hello...{Enter}{Enter}is it me you're looking for?");
            expect(input).toHaveValue("Hello...\n\nis it me you're looking for?");
        });
    });
});
