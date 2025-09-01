import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { ColumnId, GridColumn } from "../../typings/GridColumn";
import { ColumnResizer } from "../ColumnResizer";
import { Header, HeaderProps } from "../Header";

describe("Header", () => {
    it("renders the structure correctly", () => {
        const component = render(<Header {...mockHeaderProps()} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when sortable", () => {
        const props = mockHeaderProps();
        props.column.canSort = true;
        props.sortable = true;
        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when resizable", () => {
        const props = mockHeaderProps();
        props.column.canResize = true;
        props.resizable = true;
        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when draggable", () => {
        const props = mockHeaderProps();
        props.column.canDrag = true;
        props.draggable = true;
        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when filterable with no custom filter", () => {
        const props = mockHeaderProps();
        props.filterable = true;
        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when filterable with custom filter", () => {
        const props = mockHeaderProps();
        props.filterable = true;
        props.filterWidget = (
            <div>
                <label>Date picker filter</label>
                <input type="date" />
            </div>
        );
        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("calls setSortBy store function with correct parameters when sortable", async () => {
        const user = userEvent.setup();
        const mockedFunction = jest.fn();
        const props = mockHeaderProps();
        props.sortable = true;
        props.column = {
            ...props.column,
            columnId: "0" as ColumnId,
            columnNumber: 0,
            header: "My sortable column",
            canSort: true,
            sortDir: undefined,
            toggleSort: mockedFunction
        } as any;
        const component = render(<Header {...props} />);
        const button = component.getByRole("button");

        expect(button).toBeInTheDocument();
        await user.click(button);
        expect(mockedFunction).toHaveBeenCalled();
    });

    it("renders the structure correctly when filterable with custom classes", () => {
        const props = mockHeaderProps();
        props.filterable = true;

        const component = render(<Header {...props} className="my-custom-class" />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when is hidden and preview", () => {
        const props = mockHeaderProps();
        props.column.initiallyHidden = true;
        props.hidable = true;
        props.preview = true;

        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when value is empty", () => {
        const props = mockHeaderProps();
        props.column.header = " ";

        const component = render(<Header {...props} />);

        expect(component.asFragment()).toMatchSnapshot();
    });
});

function mockHeaderProps(): HeaderProps {
    return {
        gridId: "dg1",
        column: {
            columnId: "dg1-column0" as ColumnId,
            columnIndex: 0,
            header: "Test",
            sortDir: undefined,
            toggleSort: () => undefined,
            setHeaderElementRef: jest.fn(),
            alignment: "left",
            canDrag: false,
            columnClass: () => undefined,
            initiallyHidden: false,
            renderCellContent: () => createElement("div"),
            isAvailable: true,
            wrapText: false,
            canHide: false,
            isHidden: false,
            toggleHidden: () => undefined,
            canSort: false,
            canResize: false,
            size: undefined,
            setSize: () => undefined,
            getCssWidth: () => "100px"
        } as GridColumn,
        draggable: false,
        dropTarget: undefined,
        filterable: false,
        filterWidget: undefined,
        hidable: false,
        resizable: false,
        resizer: <ColumnResizer setColumnWidth={jest.fn()} />,
        sortable: false,
        swapColumns: jest.fn(),
        setDropTarget: jest.fn(),
        setIsDragging: jest.fn()
    };
}
