import { MultiSelectionStatus, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { SelectionMultiValueBuilder, list, listWidget, objectItems } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import * as testingLibrary from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "enzyme";
import { ListValue, ObjectItem, SelectionMultiValue } from "mendix";
import { ReactElement, createElement } from "react";
import { Column } from "../../helpers/Column";
import { GridColumn } from "../../typings/GridColumn";
import { column, mockWidgetProps } from "../../utils/test-utils";
import { Widget, WidgetProps } from "../Widget";
import { useGridSelectionProps } from "@mendix/widget-plugin-grid/selection/useGridSelectionProps";
import { ItemSelectionMethodEnum } from "typings/DatagridProps";
import { initColumnsState } from "../../features/use-columns-state";
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
        const component = render(<Widget {...mockWidgetProps()} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with sorting", () => {
        const component = render(<Widget {...mockWidgetProps()} columnsSortable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with resizing", () => {
        const component = render(<Widget {...mockWidgetProps()} columnsResizable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with dragging", () => {
        const component = render(<Widget {...mockWidgetProps()} columnsDraggable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with filtering", () => {
        const component = render(<Widget {...mockWidgetProps()} columnsFilterable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with hiding", () => {
        const component = render(<Widget {...mockWidgetProps()} columnsHidable />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with paging", () => {
        const component = render(<Widget {...mockWidgetProps()} paging />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with custom filtering", () => {
        const props = mockWidgetProps();
        const columns = [column("Test")].map((col, index) => new Column(col, index, props.id!));
        props.columnsFilterable = true;
        props.columnsState = initColumnsState(columns);

        const component = render(<Widget {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with empty placeholder", () => {
        const component = render(
            <Widget {...mockWidgetProps()} emptyPlaceholderRenderer={renderWrapper => renderWrapper(<div />)} />
        );

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with column alignments", () => {
        const props = mockWidgetProps();
        const columns = [
            column("Test", col => {
                col.alignment = "center";
            }),
            column("Test 2", col => (col.alignment = "right"))
        ].map((col, index) => new Column(col, index, props.id!));
        props.columnsState = initColumnsState(columns);

        const component = render(<Widget {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with dynamic row class", () => {
        const component = render(<Widget {...mockWidgetProps()} rowClass={() => "myclass"} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly for preview when no header is provided", () => {
        const props = mockWidgetProps();
        const columns = [column("", col => (col.alignment = "center"))].map(
            (col, index) => new Column(col, index, props.id!)
        );
        props.preview = true;
        props.columnsState = initColumnsState(columns);

        const component = render(<Widget {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly with header wrapper", () => {
        const component = render(
            <Widget
                {...mockWidgetProps()}
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
            <Widget
                {...mockWidgetProps()}
                headerContent={
                    <div className="my-custom-filters">
                        <span />
                    </div>
                }
                headerTitle="filter title"
            />
        );

        expect(component).toMatchSnapshot();
    });

    describe("with selection method checkbox", () => {
        const { render, screen } = testingLibrary;
        let props: ReturnType<typeof mockWidgetProps>;

        beforeEach(() => {
            props = mockWidgetProps();
            props.selectionProps.selectionType = "Single";
            props.selectionProps.selectionMethod = "checkbox";
            props.selectionProps.showCheckboxColumn = true;
            props.paging = true;
            props.data = objectItems(3);
        });

        it("render method class", () => {
            const { container } = render(<Widget {...props} />);

            expect(container.firstChild).toHaveClass("widget-datagrid-selection-method-checkbox");
        });

        it("render an extra column and add class to each selected row", () => {
            props.selectionProps.isSelected = () => true;

            const { asFragment } = render(<Widget {...props} />);

            expect(asFragment()).toMatchSnapshot();
        });

        it("render correct number of checked checkboxes", () => {
            const [a, b, c, d, e, f] = (props.data = objectItems(6));
            let selection: ObjectItem[] = [];
            props.selectionProps.isSelected = item => selection.includes(item);

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const getChecked = () => screen.getAllByRole<HTMLInputElement>("checkbox").filter(elt => elt.checked);

            const { rerender } = render(<Widget {...props} />);

            expect(getChecked()).toHaveLength(0);

            selection = [a, b, c];
            rerender(<Widget {...props} />);
            expect(getChecked()).toHaveLength(3);

            selection = [c];
            rerender(<Widget {...props} />);
            expect(getChecked()).toHaveLength(1);

            selection = [d, e];
            rerender(<Widget {...props} />);
            expect(getChecked()).toHaveLength(2);

            selection = [f, e, d, a];
            rerender(<Widget {...props} />);
            expect(getChecked()).toHaveLength(4);
        });

        it("call onSelect when checkbox is clicked", async () => {
            const items = props.data;
            const onSelect = props.selectionProps.onSelect;
            props.selectionProps.showCheckboxColumn = true;

            render(<Widget {...props} />);

            const checkbox1 = screen.getAllByRole("checkbox")[0];
            const checkbox3 = screen.getAllByRole("checkbox")[2];

            await userEvent.click(checkbox1);
            expect(onSelect).toBeCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false);
            await userEvent.click(checkbox1);
            expect(onSelect).toBeCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false);

            await userEvent.click(checkbox3);
            expect(onSelect).toBeCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[2], false);
            await userEvent.click(checkbox3);
            expect(onSelect).toBeCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[2], false);
        });
    });

    it("not render header checkbox when showCheckboxColumn is false", () => {
        const { render, screen, queryByRole } = testingLibrary;
        const props = mockWidgetProps();
        props.data = objectItems(5);
        props.paging = true;
        props.selectionProps.showCheckboxColumn = false;

        render(<Widget {...props} />);

        const colheader = screen.getAllByRole("columnheader")[0];
        expect(queryByRole(colheader, "checkbox")).toBeNull();
    });

    describe("with multi selection helper", () => {
        it("render header checkbox if helper is given and checkbox state depends on the helper status", () => {
            const { render, screen, queryByRole, cleanup } = testingLibrary;
            const props = mockWidgetProps();
            props.data = objectItems(5);
            props.paging = true;
            props.selectionProps.selectionType = "Multi";
            props.selectionProps.selectionMethod = "checkbox";
            props.selectionProps.showCheckboxColumn = true;
            props.selectionProps.showSelectAllToggle = true;

            const renderWithStatus = (status: MultiSelectionStatus): ReturnType<typeof render> => {
                return render(<Widget {...props} selectionStatus={status} />);
            };

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
            const props = mockWidgetProps();
            props.selectionProps.selectionMethod = "rowClick";

            render(<Widget {...props} />);

            const colheader = screen.getAllByRole("columnheader")[0];
            expect(queryByRole(colheader, "checkbox")).toBeNull();
        });

        it("call onSelectAll when header checkbox is clicked", async () => {
            const { render, screen } = testingLibrary;
            const props = mockWidgetProps();
            props.selectionProps.selectionMethod = "checkbox";
            props.selectionProps.showCheckboxColumn = true;
            props.selectionProps.showSelectAllToggle = true;
            props.selectionStatus = "none";

            render(<Widget {...props} />);

            const checkbox = screen.getAllByRole("checkbox")[0];

            await userEvent.click(checkbox);
            expect(props.selectionProps.onSelectAll).toBeCalledTimes(1);

            await userEvent.click(checkbox);
            expect(props.selectionProps.onSelectAll).toBeCalledTimes(2);
        });
    });

    describe("with selection method rowClick", () => {
        const { render, screen, getAllByRole } = testingLibrary;
        let props: ReturnType<typeof mockWidgetProps>;

        beforeEach(() => {
            props = mockWidgetProps();
            props.selectionProps.selectionType = "Single";
            props.selectionProps.selectionMethod = "rowClick";
            props.paging = true;
            props.data = objectItems(3);
        });

        it("render method class", () => {
            const { container } = render(<Widget {...props} />);

            expect(container.firstChild).toHaveClass("widget-datagrid-selection-method-click");
        });

        it("add class to each selected cell", () => {
            props.selectionProps.isSelected = () => true;

            const { asFragment } = render(<Widget {...props} />);

            expect(asFragment()).toMatchSnapshot();
        });

        it("call onSelect when cell is clicked", async () => {
            const items = props.data;
            const onSelect = props.selectionProps.onSelect;
            const columns = [column("Column A"), column("Column B")].map(
                (col, index) => new Column(col, index, props.id!)
            );
            props.columnsState = initColumnsState(columns);

            render(<Widget {...props} />);

            const rows = screen.getAllByRole("row").slice(1);
            expect(rows).toHaveLength(3);

            const [row1, row2] = rows;
            const [cell1, cell2] = getAllByRole(row1, "gridcell");
            const [cell3, cell4] = getAllByRole(row2, "gridcell");

            // Click cell1 two times
            await userEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false);
            await userEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false);

            // Click cell2
            await userEvent.click(cell2);
            expect(onSelect).toHaveBeenCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false);

            // Click cell3 and cell4
            await userEvent.click(cell4);
            expect(onSelect).toHaveBeenCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[1], false);
            await userEvent.click(cell3);
            expect(onSelect).toHaveBeenCalledTimes(5);
            expect(onSelect).toHaveBeenLastCalledWith(items[1], false);
        });
    });

    describe("when selecting is enabled, allow the user to select multiple rows", () => {
        const { render, screen, getByRole, getAllByRole } = testingLibrary;
        let items: ReturnType<typeof objectItems>;
        let props: ReturnType<typeof mockWidgetProps>;
        let selection: SelectionMultiValue;
        let ds: ListValue;

        function WidgetWithSelectionHelper({
            selectionMethod,
            ...props
        }: WidgetProps<GridColumn, ObjectItem> & { selectionMethod: ItemSelectionMethodEnum }): ReactElement {
            const helper = useSelectionHelper(selection, ds, undefined, 10);
            const sp = useGridSelectionProps({
                helper,
                selection,
                selectionMethod,
                showSelectAllToggle: false
            });

            return (
                <Widget
                    {...props}
                    selectionProps={sp}
                    selectionStatus={helper?.type === "Multi" ? helper.selectionStatus : "unknown"}
                />
            );
        }

        function setup(
            jsx: ReactElement
        ): ReturnType<typeof render> & { rows: HTMLElement[]; user: ReturnType<typeof userEvent.setup> } {
            const result = render(jsx);
            const user = userEvent.setup();
            const rows = screen.getAllByRole("row").slice(1);

            return {
                user,
                rows,
                ...result
            };
        }

        beforeEach(() => {
            ds = list(20);
            items = ds.items!;
            props = mockWidgetProps();
            selection = new SelectionMultiValueBuilder().build();
            props.data = items;
            const columns = [
                column("Name"),
                column("Description"),
                column("Amount", col => {
                    col.showContentAs = "customContent";
                    col.content = listWidget(() => <input />);
                })
            ].map((col, index) => new Column(col, index, props.id!));
            props.columnsState = initColumnsState(columns);
        });

        it("selects multiple rows with shift+click on a row", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="rowClick" {...props} />);

            expect(rows).toHaveLength(20);

            await user.click(rows[10].children[2]);
            expect(selection.selection).toEqual([items[10]]);

            await user.keyboard("[ShiftLeft>]");

            await user.click(rows[14].children[2]);
            expect(selection.selection).toHaveLength(5);
            expect(selection.selection).toEqual(items.slice(10, 15));

            await user.click(rows[4].children[2]);
            expect(selection.selection).toHaveLength(7);
            expect(selection.selection).toEqual(items.slice(4, 11));

            await user.click(rows[8].children[2]);
            expect(selection.selection).toHaveLength(3);
            expect(selection.selection).toEqual(items.slice(8, 11));
        });

        it("selects multiple rows with shift+click on a checkbox", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="checkbox" {...props} />);

            expect(rows).toHaveLength(20);

            await user.click(getByRole(rows[10], "checkbox"));
            expect(selection.selection).toEqual([items[10]]);

            await user.keyboard("[ShiftLeft>]");

            await user.click(getByRole(rows[14], "checkbox"));
            expect(selection.selection).toHaveLength(5);
            expect(selection.selection).toEqual(items.slice(10, 15));

            await user.click(getByRole(rows[4], "checkbox"));
            expect(selection.selection).toHaveLength(7);
            expect(selection.selection).toEqual(items.slice(4, 11));

            await user.click(getByRole(rows[8], "checkbox"));
            expect(selection.selection).toHaveLength(3);
            expect(selection.selection).toEqual(items.slice(8, 11));
        });

        it("selects all available rows with metaKey+a and method checkbox", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="checkbox" {...props} />);

            expect(rows).toHaveLength(20);

            const [row] = rows;
            const [checkbox] = getAllByRole(row, "checkbox");
            await user.click(checkbox);
            expect(checkbox).toHaveFocus();
            expect(selection.selection).toHaveLength(1);

            await user.keyboard("{Meta>}a{/Meta}");
            expect(selection.selection).toHaveLength(20);
        });

        it("selects all available rows with metaKey+a and method rowClick", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="rowClick" {...props} />);

            expect(rows).toHaveLength(20);

            const [row] = rows;
            const [cell] = getAllByRole(row, "gridcell");
            await user.click(cell);
            expect(cell).toHaveFocus();
            expect(selection.selection).toHaveLength(1);

            await user.keyboard("{Meta>}a{/Meta}");
            expect(selection.selection).toHaveLength(20);
        });

        it("selects all available rows with ctrlKey+a and method checkbox", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="checkbox" {...props} />);

            expect(rows).toHaveLength(20);

            const [row] = rows;
            const [checkbox] = getAllByRole(row, "checkbox");
            await user.click(checkbox);
            expect(checkbox).toHaveFocus();
            expect(selection.selection).toHaveLength(1);

            await user.keyboard("{Control>}a{/Control}");
            expect(selection.selection).toHaveLength(20);
        });

        it("selects all available rows with ctrlKey+a and method rowClick", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="rowClick" {...props} />);

            expect(rows).toHaveLength(20);

            const [row] = rows;
            const [cell] = getAllByRole(row, "gridcell");
            await user.click(cell);
            expect(cell).toHaveFocus();
            expect(selection.selection).toHaveLength(1);

            await user.keyboard("{Control>}a{/Control}");
            expect(selection.selection).toHaveLength(20);
        });

        it("must not select rows, when metaKey+a or ctrlKey+a pressed in custom widget", async () => {
            const { rows, user } = setup(<WidgetWithSelectionHelper selectionMethod="checkbox" {...props} />);

            expect(rows).toHaveLength(20);

            const [input] = screen.getAllByRole("textbox");
            await user.click(input);
            await user.keyboard("Hello, world!");
            expect(selection.selection).toHaveLength(0);

            await user.keyboard("{Control>}a{/Control}");
            expect(selection.selection).toHaveLength(0);

            await user.keyboard("{Meta>}a{/Meta}");
            expect(selection.selection).toHaveLength(0);
        });
    });

    describe("when has interactive element", () => {
        it("should not prevent default on keyboard input (space and Enter)", async () => {
            const { render, screen } = testingLibrary;
            const items = objectItems(3);

            const props = mockWidgetProps();
            const content = listWidget(() => <textarea />);
            const columns = Array.from(["Monday", "Tuesday", "Wednesday"], header => {
                const c = column(header);
                c.showContentAs = "customContent";
                c.content = content;
                return c;
            }).map((col, index) => new Column(col, index, props.id!));

            props.columnsState = initColumnsState(columns);

            const user = userEvent.setup();

            render(<Widget {...props} data={items} />);

            const [input] = screen.getAllByRole("textbox");
            await user.click(input);
            await user.keyboard("Hello...{Enter}{Enter}is it me you're looking for?");
            expect(input).toHaveValue("Hello...\n\nis it me you're looking for?");
        });
    });
});
