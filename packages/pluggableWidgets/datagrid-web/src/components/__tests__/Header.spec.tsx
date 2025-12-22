import { dynamic } from "@mendix/widget-plugin-test-utils";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContainerProvider } from "brandi-react";
import { createDatagridContainer } from "../../model/containers/createDatagridContainer";
import { CORE_TOKENS } from "../../model/tokens";
import { column, mockContainerProps } from "../../utils/test-utils";
import { ColumnProvider } from "../ColumnProvider";
import { ColumnResizer } from "../ColumnResizer";
import { Header, HeaderProps } from "../Header";

describe("Header", () => {
    it("renders the structure correctly", () => {
        const props = mockContainerProps({
            columns: [column("Column 1")]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} />
                </ColumnProvider>
            </ContainerProvider>
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when sortable", () => {
        const columnsType = column("Column 1", col => {
            col.sortable = true;
        });
        const props = mockContainerProps({
            columns: [columnsType]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} />
                </ColumnProvider>
            </ContainerProvider>
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when resizable", () => {
        const columnsType = column("Column 1", col => {
            col.resizable = true;
        });
        const props = mockContainerProps({
            columns: [columnsType]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} resizer={<div>resizer</div>} />
                </ColumnProvider>
            </ContainerProvider>
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when draggable", () => {
        const columnsType = column("Column 1", col => {
            col.draggable = true;
        });
        const props = mockContainerProps({
            columns: [columnsType]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} />
                </ColumnProvider>
            </ContainerProvider>
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("renders the structure correctly when filterable with custom filter", () => {
        const columnsType = column("Column 1", col => {
            col.filter = <div>Custom filter</div>;
        });
        const props = mockContainerProps({
            columns: [columnsType]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} />
                </ColumnProvider>
            </ContainerProvider>
        );

        expect(component.asFragment()).toMatchSnapshot();
    });

    it("calls sort function when sortable", async () => {
        const user = userEvent.setup();
        const columnsType = column("Column 1", col => {
            col.sortable = true;
        });
        const props = mockContainerProps({
            columns: [columnsType]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];
        const spy = jest.spyOn(col, "toggleSort");

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} />
                </ColumnProvider>
            </ContainerProvider>
        );
        const button = component.getByLabelText("sort Column 1");

        expect(button).toBeInTheDocument();
        await user.click(button);
        expect(spy).toHaveBeenCalled();
    });

    it("renders the structure correctly when value is empty", () => {
        const columnsType = column("Column 1", col => {
            col.header = dynamic(" ");
        });
        const props = mockContainerProps({
            columns: [columnsType]
        });
        const [container] = createDatagridContainer(props);
        const columns = container.get(CORE_TOKENS.columnsStore);
        const col = columns.visibleColumns[0];

        const component = render(
            <ContainerProvider container={container}>
                <ColumnProvider column={col}>
                    <Header {...mockHeaderProps()} />
                </ColumnProvider>
            </ContainerProvider>
        );
        expect(component.asFragment()).toMatchSnapshot();
    });
});

function mockHeaderProps(): HeaderProps {
    return {
        dropTarget: undefined,
        resizer: <ColumnResizer setColumnWidth={jest.fn()} />,
        setDropTarget: jest.fn(),
        setIsDragging: jest.fn()
    };
}
