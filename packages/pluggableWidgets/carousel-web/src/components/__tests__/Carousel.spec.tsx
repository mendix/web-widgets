import { createElement, ReactNode } from "react";
import { Carousel, CarouselProps } from "../Carousel";
import { render } from "@testing-library/react";
import { GUID } from "mendix";

jest.mock("swiper/react", () => ({
    Swiper: ({ children }: { children: ReactNode }) => <div data-testid="swiper-testid">{children}</div>,
    SwiperSlide: ({ children }: { children: ReactNode }) => <div data-testid="swiper-slide-testid">{children}</div>
}));

jest.mock("swiper/modules", () => ({
    Navigation: (_props: any) => null,
    Pagination: (_props: any) => null,
    Scrollbar: (_props: any) => null,
    A11y: (_props: any) => null
}));

jest.mock("swiper/css", () => jest.fn());
jest.mock("swiper/css/bundle", () => jest.fn());

describe("Carousel", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    });
    const defaultCarouselProps: CarouselProps = {
        id: "Carousel",
        className: "",
        items: [
            { id: "1" as GUID, content: <div>test1</div> },
            { id: "2" as GUID, content: <div>test2</div> }
        ],
        pagination: true,
        animation: true,
        autoplay: true,
        delay: 3000,
        loop: true,
        navigation: true,
        onClick: () => jest.fn()
    };

    it("renders correctly", () => {
        const { asFragment } = render(<Carousel {...defaultCarouselProps} />);

        expect(asFragment()).toMatchSnapshot();
    });
    it("renders correctly without pagination", () => {
        const { asFragment } = render(<Carousel {...defaultCarouselProps} pagination={false} />);

        expect(asFragment()).toMatchSnapshot();
    });
    it("renders correctly without navigation", () => {
        const { asFragment } = render(<Carousel {...defaultCarouselProps} navigation={false} />);

        expect(asFragment()).toMatchSnapshot();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
});
