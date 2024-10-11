import "@testing-library/jest-dom";
import { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { MultiSelectionStatus, SelectionHelper, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { SelectionMultiValueBuilder, list, listWidget, objectItems } from "@mendix/widget-plugin-test-utils";
import { cleanup, getAllByRole, getByRole, queryByRole, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListValue, ObjectItem, SelectionMultiValue } from "mendix";
import { ReactElement, createElement } from "react";
import { CellEventsController, useCellEventsController } from "../../features/row-interaction/CellEventsController";
import {
    CheckboxEventsController,
    useCheckboxEventsController
} from "../../features/row-interaction/CheckboxEventsController";
import { SelectActionHelper, useSelectActionHelper } from "../../helpers/SelectActionHelper";
import { GridColumn } from "../../typings/GridColumn";
import { column, mockGridColumn, mockProvideHelpers, mockWidgetProps } from "../../utils/test-utils";
import { Widget, WidgetProps } from "../Widget";
import { ItemSelectionMethodEnum } from "typings/DatagridProps";
import { HelpersProvider } from "../../helpers/helpers-context";

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
    function renderWidget(
        props: WidgetProps<GridColumn, ObjectItem>,
        helpers = mockProvideHelpers()
    ): ReturnType<typeof render> {
        return render(
            <HelpersProvider value={helpers}>
                <Widget {...props} />
            </HelpersProvider>
        );
    }
    it("renders the structure correctly", () => {
        const component = renderWidget(mockWidgetProps());

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with sorting", () => {
        const component = renderWidget({ ...mockWidgetProps(), columnsSortable: true });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with resizing", () => {
        const component = renderWidget({ ...mockWidgetProps(), columnsResizable: true });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with dragging", () => {
        const component = renderWidget({ ...mockWidgetProps(), columnsDraggable: true });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with filtering", () => {
        const component = renderWidget({ ...mockWidgetProps(), columnsFilterable: true });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with hiding", () => {
        const component = renderWidget({ ...mockWidgetProps(), columnsHidable: true });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with paging", () => {
        const component = renderWidget({ ...mockWidgetProps(), paging: true });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with custom filtering", () => {
        const props = mockWidgetProps();
        const columns = [column("Test")].map((col, index) => mockGridColumn(col, index));
        props.columnsFilterable = true;
        props.visibleColumns = columns;
        props.availableColumns = columns;
        const component = renderWidget(props);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with empty placeholder", () => {
        const component = renderWidget({
            ...mockWidgetProps(),
            emptyPlaceholderRenderer: renderWrapper => renderWrapper(<div />)
        });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with column alignments", () => {
        const props = mockWidgetProps();
        const columns = [
            column("Test", col => {
                col.alignment = "center";
            }),
            column("Test 2", col => (col.alignment = "right"))
        ].map((col, index) => mockGridColumn(col, index));

        props.visibleColumns = columns;
        props.availableColumns = columns;

        const component = renderWidget(props);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with dynamic row class", () => {
        const component = renderWidget({ ...mockWidgetProps(), rowClass: () => "myclass" });

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly for preview when no header is provided", () => {
        const props = mockWidgetProps();
        const columns = [column("", col => (col.alignment = "center"))].map((col, index) => mockGridColumn(col, index));
        props.preview = true;
        props.visibleColumns = columns;
        props.availableColumns = columns;

        const component = renderWidget(props);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with header wrapper", () => {
        const props = mockWidgetProps();
        props.headerWrapperRenderer = (index, header) => (
            <div key={`header_wrapper_${index}`} className="my-custom-header">
                {header}
            </div>
        );
        const component = renderWidget(props);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly with header filters and a11y", () => {
        const props = mockWidgetProps();
        props.headerContent = (
            <div className="my-custom-filters">
                <span />
            </div>
        );
        props.headerTitle = "filter title";
        const component = renderWidget(props);

        expect(component.asFragment()).toMatchSnapshot();
    });

    describe("with selection method checkbox", () => {
        let props: ReturnType<typeof mockWidgetProps>;
        let helpers: ReturnType<typeof mockProvideHelpers>;

        beforeEach(() => {
            props = mockWidgetProps();
            helpers = mockProvideHelpers();
            helpers.selectActionHelper = new SelectActionHelper("Single", undefined, "checkbox", false, 5, "clear");
            props.gridInteractive = true;
            props.paging = true;
            props.data = objectItems(3);
        });

        it("render method class", () => {
            const { container } = renderWidget(props, helpers);

            expect(container.firstChild).toHaveClass("widget-datagrid-selection-method-checkbox");
        });

        it("render an extra column and add class to each selected row", () => {
            helpers.selectActionHelper.isSelected = () => true;

            const { asFragment } = renderWidget(props, helpers);

            expect(asFragment()).toMatchSnapshot();
        });

        it("render correct number of checked checkboxes", () => {
            const [a, b, c, d, e, f] = (props.data = objectItems(6));
            let selection: ObjectItem[] = [];
            helpers.selectActionHelper.isSelected = item => selection.includes(item);

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const getChecked = () => screen.getAllByRole<HTMLInputElement>("checkbox").filter(elt => elt.checked);

            const Wrapped = (props: WidgetProps<GridColumn, ObjectItem>): JSX.Element => (
                <HelpersProvider value={helpers}>
                    <Widget {...props} />
                </HelpersProvider>
            );
            const { rerender } = render(<Wrapped {...props} />);

            expect(getChecked()).toHaveLength(0);

            selection = [a, b, c];
            rerender(<Wrapped {...props} data={[a, b, c, d, e, f]} />);
            expect(getChecked()).toHaveLength(3);

            selection = [c];
            rerender(<Wrapped {...props} data={[a, b, c, d, e, f]} />);
            expect(getChecked()).toHaveLength(1);

            selection = [d, e];
            rerender(<Wrapped {...props} data={[a, b, c, d, e, f]} />);
            expect(getChecked()).toHaveLength(2);

            selection = [f, e, d, a];
            rerender(<Wrapped {...props} data={[a, b, c, d, e, f]} />);
            expect(getChecked()).toHaveLength(4);
        });

        it("call onSelect when checkbox is clicked", async () => {
            const items = props.data;
            const onSelect = jest.fn();
            helpers.selectActionHelper.onSelect = onSelect;
            helpers.checkboxEventsController = new CheckboxEventsController(
                item => ({
                    item,
                    selectionMethod: helpers.selectActionHelper.selectionMethod,
                    selectionType: "Single",
                    selectionMode: "clear",
                    pageSize: props.pageSize
                }),
                onSelect,
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            renderWidget(props, helpers);

            const checkbox1 = screen.getAllByRole("checkbox")[0];
            const checkbox3 = screen.getAllByRole("checkbox")[2];

            await userEvent.click(checkbox1);
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false, true);

            await userEvent.click(checkbox1);
            expect(onSelect).toHaveBeenCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false, true);

            await userEvent.click(checkbox3);
            expect(onSelect).toHaveBeenCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[2], false, true);

            await userEvent.click(checkbox3);
            expect(onSelect).toHaveBeenCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[2], false, true);
        });
    });

    it("not render header checkbox when showCheckboxColumn is false", () => {
        const props = mockWidgetProps();
        props.data = objectItems(5);
        props.paging = true;
        const helpers = mockProvideHelpers();
        helpers.selectActionHelper = new SelectActionHelper("Multi", undefined, "checkbox", false, 5, "clear");
        renderWidget(props, helpers);

        const colheader = screen.getAllByRole("columnheader")[0];
        expect(queryByRole(colheader, "checkbox")).toBeNull();
    });

    describe("with multi selection helper", () => {
        it("render header checkbox if helper is given and checkbox state depends on the helper status", () => {
            const props = mockWidgetProps();
            const helpers = mockProvideHelpers();
            props.data = objectItems(5);
            props.paging = true;

            const renderWithStatus = (status: MultiSelectionStatus): ReturnType<typeof render> => {
                helpers.selectActionHelper = new SelectActionHelper("Multi", undefined, "checkbox", true, 5, "clear");
                helpers.selectionHelper = jest.mocked<SelectionHelper>({
                    type: "Multi",
                    selectionStatus: status
                } as any);
                return renderWidget(props, helpers);
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
            const props = mockWidgetProps();
            const helpers = mockProvideHelpers();
            helpers.selectActionHelper = new SelectActionHelper("Multi", undefined, "rowClick", false, 5, "clear");

            renderWidget(props, helpers);

            const colheader = screen.getAllByRole("columnheader")[0];
            expect(queryByRole(colheader, "checkbox")).toBeNull();
        });

        it("call onSelectAll when header checkbox is clicked", async () => {
            const props = mockWidgetProps();
            const helpers = mockProvideHelpers();
            helpers.selectActionHelper = new SelectActionHelper("Multi", undefined, "checkbox", true, 5, "clear");
            helpers.selectActionHelper.onSelectAll = jest.fn();
            helpers.selectionHelper = jest.mocked<SelectionHelper>({ type: "Multi", selectionStatus: "none" } as any);

            renderWidget(props, helpers);

            const checkbox = screen.getAllByRole("checkbox")[0];

            await userEvent.click(checkbox);
            expect(helpers.selectActionHelper.onSelectAll).toHaveBeenCalledTimes(1);

            await userEvent.click(checkbox);
            expect(helpers.selectActionHelper.onSelectAll).toHaveBeenCalledTimes(2);
        });
    });

    describe("with selection method rowClick", () => {
        let props: ReturnType<typeof mockWidgetProps>;
        let helpers: ReturnType<typeof mockProvideHelpers>;

        beforeEach(() => {
            props = mockWidgetProps();
            helpers = mockProvideHelpers();
            helpers.selectActionHelper = new SelectActionHelper("Single", undefined, "rowClick", true, 5, "clear");
            props.gridInteractive = true;
            props.paging = true;
            props.data = objectItems(3);
        });

        it("render method class", () => {
            const { container } = renderWidget(props, helpers);
            expect(container.firstChild).toHaveClass("widget-datagrid-selection-method-click");
        });

        it("add class to each selected cell", () => {
            helpers.selectActionHelper.isSelected = () => true;

            const { asFragment } = renderWidget(props, helpers);

            expect(asFragment()).toMatchSnapshot();
        });

        it("call onSelect when cell is clicked", async () => {
            const items = props.data;
            const onSelect = jest.fn();
            const columns = [column("Column A"), column("Column B")].map((col, index) => mockGridColumn(col, index));
            props.visibleColumns = columns;
            props.availableColumns = columns;
            helpers.cellEventsController = new CellEventsController(
                item => ({
                    item,
                    selectionType: helpers.selectActionHelper.selectionType,
                    selectionMethod: helpers.selectActionHelper.selectionMethod,
                    selectionMode: "clear",
                    clickTrigger: "none",
                    pageSize: props.pageSize
                }),
                onSelect,
                jest.fn(),
                jest.fn(),
                jest.fn(),
                jest.fn()
            );

            renderWidget(props, helpers);

            const rows = screen.getAllByRole("row").slice(1);
            expect(rows).toHaveLength(3);

            const [row1, row2] = rows;
            const [cell1, cell2] = getAllByRole(row1, "gridcell");
            const [cell3, cell4] = getAllByRole(row2, "gridcell");

            const sleep = (t: number): Promise<void> => new Promise(res => setTimeout(res, t));

            // Click cell1 two times
            await userEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(1);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false, false);
            await sleep(320);

            await userEvent.click(cell1);
            expect(onSelect).toHaveBeenCalledTimes(2);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false, false);
            await sleep(320);

            // Click cell2
            await userEvent.click(cell2);
            expect(onSelect).toHaveBeenCalledTimes(3);
            expect(onSelect).toHaveBeenLastCalledWith(items[0], false, false);
            await sleep(320);

            // Click cell3 and cell4
            await userEvent.click(cell4);
            expect(onSelect).toHaveBeenCalledTimes(4);
            expect(onSelect).toHaveBeenLastCalledWith(items[1], false, false);
            await sleep(320);

            await userEvent.click(cell3);
            expect(onSelect).toHaveBeenCalledTimes(5);
            expect(onSelect).toHaveBeenLastCalledWith(items[1], false, false);
        });
    });

    describe("when selecting is enabled, allow the user to select multiple rows", () => {
        let items: ReturnType<typeof objectItems>;
        let props: ReturnType<typeof mockWidgetProps>;
        let selection: SelectionMultiValue;
        let ds: ListValue;

        function WidgetWithSelectionHelper({
            selectionMethod,
            ...props
        }: WidgetProps<GridColumn, ObjectItem> & {
            selectionMethod: ItemSelectionMethodEnum;
        }): ReactElement {
            const { focusController } = mockProvideHelpers();
            const selectionHelper = useSelectionHelper(selection, ds, undefined);
            const selectActionHelper = useSelectActionHelper(
                {
                    itemSelection: selection,
                    itemSelectionMethod: selectionMethod,
                    itemSelectionMode: "clear",
                    showSelectAllToggle: false,
                    pageSize: 5
                },
                selectionHelper
            );
            const cellEventsController = useCellEventsController(
                selectActionHelper,
                new ClickActionHelper("single", null),
                focusController
            );

            const checkboxEventsController = useCheckboxEventsController(selectActionHelper, focusController);

            const helpers = Object.freeze({
                cellEventsController,
                checkboxEventsController,
                focusController,
                selectActionHelper,
                selectionHelper,
                preview: false
            });

            return (
                <HelpersProvider value={helpers}>
                    <Widget {...props} />
                </HelpersProvider>
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
            ].map((col, index) => mockGridColumn(col, index));

            props.visibleColumns = columns;
            props.availableColumns = columns;
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
            const items = objectItems(3);

            const props = mockWidgetProps();
            const content = listWidget(() => <textarea />);
            const columns = Array.from(["Monday", "Tuesday", "Wednesday"], header => {
                const c = column(header);
                c.showContentAs = "customContent";
                c.content = content;
                return c;
            }).map((col, index) => mockGridColumn(col, index));

            props.visibleColumns = columns;
            props.availableColumns = columns;

            const user = userEvent.setup();

            renderWidget({ ...props, data: items });

            const [input] = screen.getAllByRole("textbox");
            await user.click(input);
            await user.keyboard("Hello...{Enter}{Enter}is it me you're looking for?");
            expect(input).toHaveValue("Hello...\n\nis it me you're looking for?");
        });
    });
});
