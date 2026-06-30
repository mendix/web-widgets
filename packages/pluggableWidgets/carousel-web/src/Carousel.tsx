import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import classNames from "classnames";
import { GUID, ObjectItem, ValueStatus } from "mendix";
import { ReactNode, useCallback, useId, useMemo } from "react";

import { type CarouselContainerProps } from "../typings/CarouselProps";
import { Carousel as CarouselComponent } from "./components/Carousel";

import loadingCircleSvg from "./ui/loading-circle.svg";

import "./ui/Carousel.scss";

export function Carousel(props: CarouselContainerProps): ReactNode {
    const {
        showPagination,
        loop,
        tabIndex,
        navigation,
        animation,
        delay,
        autoplay,
        slidesPerView,
        slidesPerGroup,
        dataSource,
        content
    } = props;
    const onClick = useCallback(() => executeAction(props.onClickAction), [props.onClickAction]);
    const id = useId();
    const carouselItems = useMemo(
        () =>
            dataSource?.items?.map((item: ObjectItem) => ({
                id: item.id as GUID,
                content: content?.get(item)
            })) ?? [],
        [dataSource]
    );

    if (dataSource?.status !== ValueStatus.Available) {
        return (
            <div className={classNames(props.class, "widget-carousel")} tabIndex={tabIndex}>
                <img src={loadingCircleSvg} className="widget-carousel-loading-spinner" alt="" aria-hidden />
            </div>
        );
    }

    return (
        <CarouselComponent
            id={id}
            className={props.class}
            tabIndex={tabIndex}
            pagination={showPagination}
            loop={loop}
            slidesPerView={slidesPerView}
            slidesPerGroup={slidesPerGroup}
            animation={animation}
            autoplay={autoplay}
            delay={delay}
            navigation={navigation}
            items={carouselItems}
            onClick={onClick}
        />
    );
}
