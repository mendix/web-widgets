import { render, screen } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { setupIntersectionObserverStub } from "@mendix/widget-plugin-test-utils";
import { createDatagridContainer } from "../../model/containers/createDatagridContainer";
import { mockContainerProps } from "../../utils/test-utils";
import { PagingPositionEnum } from "../../../typings/DatagridProps";
import { WidgetTopBar } from "../WidgetTopBar";

setupIntersectionObserverStub();

function renderTopBar(pagingPosition: PagingPositionEnum): void {
    const [container] = createDatagridContainer(
        mockContainerProps({
            useCustomPagination: true,
            customPagination: <div>Custom pagination widgets</div>,
            pagingPosition
        })
    );
    render(
        <ContainerProvider container={container}>
            <WidgetTopBar />
        </ContainerProvider>
    );
}

describe("WidgetTopBar custom pagination", () => {
    it("renders custom pagination when position is top", () => {
        renderTopBar("top");
        expect(screen.getByText("Custom pagination widgets")).toBeInTheDocument();
    });

    it("does not render custom pagination when position is bottom", () => {
        renderTopBar("bottom");
        expect(screen.queryByText("Custom pagination widgets")).not.toBeInTheDocument();
    });

    it("does not render custom pagination when position is both (renders once, in the footer)", () => {
        renderTopBar("both");
        expect(screen.queryByText("Custom pagination widgets")).not.toBeInTheDocument();
    });
});
