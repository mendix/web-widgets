import { render, RenderOptions } from "@testing-library/react";
import { Container } from "brandi";
import { ContainerProvider } from "brandi-react";
import { ReactElement } from "react";
import { createGalleryContainer } from "../../model/containers/createGalleryContainer";
import { mockContainerProps } from "../../utils/mock-container-props";
import { GalleryRoot } from "../GalleryRoot";

/** Function to bind hook context to provided container. */
const renderWithContainer = (
    ui: ReactElement<any>,
    ct: Container,
    options?: RenderOptions
): ReturnType<typeof render> => {
    return render(
        <ContainerProvider container={ct} isolated>
            {ui}
        </ContainerProvider>,
        options
    );
};

describe("GalleryRoot", () => {
    it("should render with correct className, style and tabIndex", () => {
        const props = mockContainerProps();
        const [container] = createGalleryContainer({ ...props, tabIndex: 42, style: { color: "blue" } });
        const { asFragment } = renderWithContainer(<GalleryRoot />, container);
        expect(asFragment()).toMatchSnapshot();
    });
});
