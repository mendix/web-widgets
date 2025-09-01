import { createElement } from "react";
import { Carousel, CarouselProps } from "../Carousel";
import { render } from "@testing-library/react";
import { GUID } from "mendix";

jest.mock("swiper/css", () => ({}));
jest.mock("swiper/css/bundle", () => ({}));

jest.mock("swiper/modules", () => ({
    A11y: jest.fn(),
    Navigation: jest.fn(),
    Pagination: jest.fn(),
    EffectFade: jest.fn(),
    Autoplay: jest.fn()
}));

jest.mock("swiper/react", () => ({
    Swiper: ({
        children,
        navigation,
        pagination,
        onClick,
        onSwiper,
        onActiveIndexChange,
        wrapperTag = "div",
        ...props
    }: any) => {
        if (onSwiper) {
            const mockSwiper = { realIndex: 0 };
            onSwiper(mockSwiper);
        }
        if (onActiveIndexChange) {
            const mockSwiper = { realIndex: 0 };
            onActiveIndexChange(mockSwiper);
        }

        const swiperClasses = [
            "swiper",
            props.effect === "fade" ? "swiper-fade" : "",
            "swiper-initialized",
            "swiper-horizontal",
            "swiper-watch-progress"
        ]
            .filter(Boolean)
            .join(" ");

        const wrapperId = "swiper-wrapper-2222222222222222";

        const navigationElements = navigation
            ? [
                  createElement("div", {
                      key: "prev",
                      className: "swiper-button-prev",
                      role: "button",
                      tabIndex: 0,
                      "aria-controls": wrapperId,
                      "aria-label": "Previous slide"
                  }),
                  createElement("div", {
                      key: "next",
                      className: "swiper-button-next",
                      role: "button",
                      tabIndex: 0,
                      "aria-controls": wrapperId,
                      "aria-label": "Next slide"
                  })
              ]
            : [];

        const paginationElement = pagination
            ? createElement(
                  "div",
                  {
                      key: "pagination",
                      className:
                          "swiper-pagination swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal"
                  },
                  Array.isArray(children)
                      ? children.map((_, index) =>
                            createElement("span", {
                                key: index,
                                className: `swiper-pagination-bullet ${
                                    index === 0 ? "swiper-pagination-bullet-active" : ""
                                }`,
                                role: "button",
                                tabIndex: 0,
                                "aria-label": `Go to slide ${index}`,
                                "aria-controls": `carousel-slide-Carousel-${index + 1}`,
                                "aria-current": index === 0 ? "true" : undefined
                            })
                        )
                      : []
              )
            : null;

        const notificationElement = createElement("span", {
            key: "notification",
            className: "swiper-notification",
            "aria-live": "assertive",
            "aria-atomic": "true"
        });

        const WrapperTag = wrapperTag as any;

        return createElement(
            "div",
            {
                className: swiperClasses,
                onClick
            },
            [
                createElement(
                    WrapperTag,
                    {
                        key: "wrapper",
                        className: "swiper-wrapper",
                        id: wrapperId,
                        "aria-live": "off",
                        style: { transitionDuration: "0ms" }
                    },
                    children
                ),
                ...navigationElements,
                paginationElement,
                notificationElement
            ].filter(Boolean)
        );
    },
    SwiperSlide: ({ children, tag = "div", id }: any) => {
        let slideIndex = 0;
        const totalSlides = 2;

        if (id && id.includes("carousel-slide-Carousel-")) {
            const slideIdPart = id.split("carousel-slide-Carousel-")[1];
            slideIndex = parseInt(slideIdPart, 10) - 1;
        }

        const SlideTag = tag as any;
        return createElement(
            SlideTag,
            {
                className: "swiper-slide",
                id,
                role: "listitem",
                "aria-hidden": slideIndex !== 0 ? "true" : "false",
                "aria-label": `${slideIndex + 1} / ${totalSlides}`,
                "data-swiper-slide-index": slideIndex
            },
            children
        );
    }
}));

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
    it("renders correctly with minimal setup", () => {
        const { asFragment } = render(<Carousel {...defaultCarouselProps} pagination={false} navigation={false} />);

        expect(asFragment()).toMatchSnapshot();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
});
