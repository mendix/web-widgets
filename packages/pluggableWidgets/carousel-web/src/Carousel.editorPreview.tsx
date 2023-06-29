import { createElement, ReactNode, useId } from "react";
import { CarouselPreviewProps } from "../typings/CarouselProps";
import { Carousel } from "./components/Carousel";
import { GUID } from "mendix";

export function getPreviewCss(): string {
    return require("./ui/Carousel.scss");
}

export function preview(props: CarouselPreviewProps): ReactNode {
    const id = useId();
    return (
        <Carousel
            id={id}
            className={props.className}
            navigation={props.navigation}
            pagination={props.showPagination}
            loop={false}
            items={[
                {
                    id: "1" as GUID,
                    content: (
                        <props.content.renderer caption="Carousel item content">
                            <div />
                        </props.content.renderer>
                    )
                }
            ]}
        />
    );
}
