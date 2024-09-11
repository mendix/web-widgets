import { render, shallow } from "enzyme";
import { createElement } from "react";
import { GridColumn } from "../../typings/GridColumn";
import { ColumnResizer } from "../ColumnResizer";
import { Header, HeaderProps } from "../Header";

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
        const mockedFunction = jest.fn();
        const column = {
            columnId: "0",
            columnNumber: 0,
            header: "My sortable column",
            canSort: true,
            sortDir: undefined,
            toggleSort: mockedFunction
        } as any;

        const component = shallow(<Header {...mockHeaderProps()} column={column} sortable />);

        const clickableRegion = component.find(".column-header");

        expect(clickableRegion).toHaveLength(1);

        clickableRegion.simulate("click");
        expect(mockedFunction).toHaveBeenCalled();
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
            columnIndex: 0,
            header: "Test",
            sortDir: undefined,
            toggleSort: () => undefined
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
