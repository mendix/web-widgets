import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { CarouselPreviewProps } from "../../typings/CarouselProps";
import { CarouselPreviewComponent } from "../Carousel.editorPreview";

const renderer = ({ children }: { children: ReactNode }): ReactNode => children;

const defaultProps = {
    className: "",
    dataSource: {},
    content: { renderer },
    showPagination: true,
    navigation: true,
    autoplay: false,
    delay: 1000,
    loop: true,
    slidesPerView: 1,
    slidesPerGroup: 1,
    animation: true,
    onClickAction: null
} as unknown as CarouselPreviewProps;

describe("Carousel preview", () => {
    it.each([1, 3, 10])("renders %i slides for slidesPerView %i", slidesPerView => {
        const { container } = render(<CarouselPreviewComponent {...defaultProps} slidesPerView={slidesPerView} />);

        expect(container.querySelectorAll(".widget-carousel-preview-slide")).toHaveLength(slidesPerView);
    });

    it("falls back to a single slide when slidesPerView is empty or invalid", () => {
        const { container, rerender } = render(<CarouselPreviewComponent {...defaultProps} slidesPerView={null} />);
        expect(container.querySelectorAll(".widget-carousel-preview-slide")).toHaveLength(1);

        rerender(<CarouselPreviewComponent {...defaultProps} slidesPerView={0} />);
        expect(container.querySelectorAll(".widget-carousel-preview-slide")).toHaveLength(1);
    });

    it("shows a placeholder when no datasource is selected", () => {
        const { getAllByText } = render(<CarouselPreviewComponent {...defaultProps} dataSource={null} />);

        expect(getAllByText("[No datasource selected]")).toHaveLength(1);
    });

    it("hides navigation and pagination when disabled", () => {
        const { container } = render(
            <CarouselPreviewComponent {...defaultProps} navigation={false} showPagination={false} />
        );

        expect(container.querySelector(".widget-carousel-preview-nav")).toBeNull();
        expect(container.querySelector(".widget-carousel-preview-pagination")).toBeNull();
    });
});
