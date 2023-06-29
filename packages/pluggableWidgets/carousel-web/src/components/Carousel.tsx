import { createElement, ReactNode, ReactElement, useCallback, useState } from "react";
import { GUID } from "mendix";
import classNames from "classnames";
import { SwiperOptions, A11y, Navigation, Pagination, EffectFade, Autoplay } from "swiper";
import { Swiper as ReactSwiper, SwiperClass, SwiperSlide } from "swiper/react";
import { PaginationOptions } from "swiper/types";

interface CarouselItem {
    id: GUID;
    content?: ReactNode;
}

export interface CarouselProps {
    id: string;
    pagination: boolean;
    loop: boolean;
    animation?: boolean;
    autoplay?: boolean;
    delay?: number;
    navigation: boolean;
    className: string;
    tabIndex?: number | undefined;
    onClick?: () => void;
    items: CarouselItem[];
}

export function Carousel(props: CarouselProps): ReactElement {
    const { items, pagination, loop, animation, autoplay, delay, navigation, className, tabIndex, id, onClick } = props;
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const getSlideId = useCallback(
        (item: CarouselItem | undefined): string => {
            return `carousel-slide-${id}-${item?.id}`;
        },
        [id]
    );

    const paginationOptions: PaginationOptions | boolean = pagination && {
        type: "bullets",
        clickable: true,
        renderBullet: (index, className) =>
            `<span role="button" aria-controls="${getSlideId(
                items[index]
            )}" aria-label="Go to slide ${index}" class="${className}"></span>`
    };

    const options: SwiperOptions = {
        slidesPerView: 1,
        centeredSlides: true,
        loop,
        navigation,
        autoplay: autoplay ? { delay, stopOnLastSlide: true } : false,
        pagination: paginationOptions,
        ...(animation && {
            effect: "fade",
            fadeEffect: { crossFade: true }
        }),
        modules: [A11y, Navigation, Pagination, EffectFade, Autoplay],
        a11y: {
            enabled: true,
            slideRole: "listitem"
        }
    };

    const updateSwiperIndex = useCallback((swiper: SwiperClass) => {
        setActiveIndex(swiper.realIndex);
    }, []);

    return (
        <div className={classNames(className, "widget-carousel")} tabIndex={tabIndex}>
            <ReactSwiper
                onActiveIndexChange={updateSwiperIndex}
                wrapperTag={"ul"}
                {...options}
                onClick={onClick}
                onSwiper={updateSwiperIndex}
            >
                {items?.map((item, index) => (
                    <SwiperSlide tag={"li"} aria-hidden={index !== activeIndex} key={item.id} id={getSlideId(item)}>
                        {item.content}
                    </SwiperSlide>
                ))}
            </ReactSwiper>
        </div>
    );
}
