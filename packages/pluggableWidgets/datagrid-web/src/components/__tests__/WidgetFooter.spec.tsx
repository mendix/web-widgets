import { render, screen } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { setupIntersectionObserverStub } from "@mendix/widget-plugin-test-utils";
import { createDatagridContainer } from "../../model/containers/createDatagridContainer";
import { mockContainerProps } from "../../utils/test-utils";
import { PagingPositionEnum } from "../../../typings/DatagridProps";
import { WidgetFooter } from "../WidgetFooter";

setupIntersectionObserverStub();

function renderFooter(pagingPosition: PagingPositionEnum): void {
    const [container] = createDatagridContainer(
        mockContainerProps({
            useCustomPagination: true,
            customPagination: <div>Custom pagination widgets</div>,
            pagingPosition
        })
    );
    render(
        <ContainerProvider container={container}>
            <WidgetFooter />
        </ContainerProvider>
    );
}

describe("WidgetFooter custom pagination", () => {
    it("renders custom pagination when position is bottom", () => {
        renderFooter("bottom");
        expect(screen.getByText("Custom pagination widgets")).toBeInTheDocument();
    });

    it("renders custom pagination when position is both", () => {
        renderFooter("both");
        expect(screen.getByText("Custom pagination widgets")).toBeInTheDocument();
    });

    it("does not render custom pagination when position is top", () => {
        renderFooter("top");
        expect(screen.queryByText("Custom pagination widgets")).not.toBeInTheDocument();
    });
});
