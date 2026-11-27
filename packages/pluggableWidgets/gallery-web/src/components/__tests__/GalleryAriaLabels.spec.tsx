import { render, screen } from "@testing-library/react";
import { ContainerProvider } from "brandi-react";
import { list } from "@mendix/widget-plugin-test-utils";
import { GalleryContainerProps } from "../../../typings/GalleryProps";
import { createGalleryContainer } from "../../model/containers/createGalleryContainer";
import { mockContainerProps, mockTexts } from "../../utils/mock-container-props";
import { EmptyPlaceholder } from "../EmptyPlaceholder";
import { GalleryHeader } from "../GalleryHeader";
import { GalleryItems } from "../GalleryItems";

function renderGallery(overrides: Partial<GalleryContainerProps> = {}): void {
    const [container] = createGalleryContainer({
        ...mockContainerProps(),
        filtersPlaceholder: <input aria-label="Search" />,
        emptyPlaceholder: <span>Nothing here</span>,
        ...overrides
    });
    render(
        <ContainerProvider container={container} isolated>
            <GalleryHeader />
            <GalleryItems />
            <EmptyPlaceholder />
        </ContainerProvider>
    );
}

describe("Gallery aria labels", () => {
    it("labels the filter section and the item list with the default system texts", () => {
        renderGallery();

        expect(screen.getByRole("region", { name: "Filters" })).toContainElement(screen.getByLabelText("Search"));
        expect(screen.getByRole("list", { name: "Gallery" })).toBeInTheDocument();
    });

    it("labels the empty message section with the default system text", () => {
        renderGallery({ datasource: list(0) });

        expect(screen.getByRole("region", { name: "No items" })).toHaveTextContent("Nothing here");
    });

    it("uses translated or overridden system texts", () => {
        renderGallery({
            texts: mockTexts({ filterSectionTitle: "Filteren", ariaLabelListBox: "Producten" })
        });

        expect(screen.getByRole("region", { name: "Filteren" })).toBeInTheDocument();
        expect(screen.getByRole("list", { name: "Producten" })).toBeInTheDocument();
    });

    it("uses an overridden empty message text", () => {
        renderGallery({ datasource: list(0), texts: mockTexts({ emptyMessageTitle: "Geen producten" }) });

        expect(screen.getByRole("region", { name: "Geen producten" })).toBeInTheDocument();
    });
});
