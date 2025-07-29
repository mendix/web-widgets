import { createElement } from "react";
import { Carousel, CarouselProps } from "../Carousel";
import { render } from "@testing-library/react";
import { GUID } from "mendix";

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
