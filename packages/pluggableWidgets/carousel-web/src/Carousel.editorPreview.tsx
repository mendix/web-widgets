import { createElement, ReactElement } from "react";
import { CarouselPreviewProps } from "../typings/CarouselProps";
import { Carousel } from "./components/Carousel";
import { GUID } from "mendix";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";

export function getPreviewCss(): string {
    return require("./ui/Carousel.scss");
}

export function CarouselPreviewComponent(props: CarouselPreviewProps): ReactElement {
    return (
        <Carousel
            id={generateUUID().toString()}
            className={props.className}
            navigation={props.navigation}
            pagination={props.showPagination}
            loop={false}
            items={["1", "2", "3"].map(item => ({
                id: item as GUID,
                content: (
                    <props.content.renderer caption={`Carousel item content ${item}`}>
                        <div>{`Carousel item content ${item}`}</div>
                    </props.content.renderer>
                )
            }))}
        />
    );
}

export function preview(props: CarouselPreviewProps): ReactElement {
    return <CarouselPreviewComponent {...props} />;
}
