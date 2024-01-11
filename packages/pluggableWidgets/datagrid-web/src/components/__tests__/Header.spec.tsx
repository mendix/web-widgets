import { render, shallow } from "enzyme";
import { createElement } from "react";
import { Header, HeaderProps } from "../Header";
import { ColumnResizer } from "../ColumnResizer";
import { GridColumn } from "../../typings/GridColumn";

describe("Header", () => {
    it("renders the structure correctly", () => {
        const component = render(<Header {...mockHeaderProps()} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when sortable", () => {
        const props = mockHeaderProps();
        props.column.canSort = true;
        props.sortable = true;

        const component = render(<Header {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when resizable", () => {
        const props = mockHeaderProps();
        props.column.canResize = true;
        props.resizable = true;

        const component = render(<Header {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when draggable", () => {
        const props = mockHeaderProps();
        props.column.canDrag = true;
        props.draggable = true;

        const component = render(<Header {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when filterable with no custom filter", () => {
        const props = mockHeaderProps();
        props.filterable = true;

        const component = render(<Header {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when filterable with custom filter", () => {
        const props = mockHeaderProps();
        const filterWidget = (
            <div>
                <label>Date picker filter</label>
                <input type="date" />
            </div>
        );
        props.filterable = true;

        const component = render(<Header {...props} filterWidget={filterWidget} />);

        expect(component).toMatchSnapshot();
    });

    it("calls setSortBy store function with correct parameters when sortable", () => {
        const column = {
            columnId: "0",
            columnNumber: 0,
            header: "My sortable column",
            canSort: true
        } as any;
        const mockedFunction = jest.fn();
        const component = shallow(
            <Header {...mockHeaderProps()} column={column} sortable setSortBy={mockedFunction} />
        );

        const clickableRegion = component.find(".column-header");

        expect(clickableRegion).toHaveLength(1);

        clickableRegion.simulate("click");
        expect(mockedFunction).toHaveBeenLastCalledWith("0");
    });

    it("renders the structure correctly when filterable with custom classes", () => {
        const props = mockHeaderProps();
        props.filterable = true;

        const component = render(<Header {...props} className="my-custom-class" />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when is hidden and preview", () => {
        const props = mockHeaderProps();
        props.column.initiallyHidden = true;
        props.hidable = true;
        props.preview = true;

        const component = render(<Header {...props} />);

        expect(component).toMatchSnapshot();
    });

    it("renders the structure correctly when value is empty", () => {
        const props = mockHeaderProps();
        props.column.header = " ";

        const component = render(<Header {...props} />);

        expect(component).toMatchSnapshot();
    });
});

function mockHeaderProps(): HeaderProps {
    return {
        gridId: "dg1",
        column: {
            columnId: "dg1-column0",
            columnNumber: 0,
            header: "Test"
        } as GridColumn,
        draggable: false,
        dragOver: undefined,
        filterable: false,
        filterWidget: undefined,
        hidable: false,
        resizable: false,
        resizer: <ColumnResizer setColumnWidth={jest.fn()} />,
        sortable: false,
        swapColumns: jest.fn(),
        setDragOver: jest.fn(),
        visibleColumns: [],
        setSortBy: jest.fn(),
        setIsDragging: jest.fn(),
        sortRule: undefined
    };
}
