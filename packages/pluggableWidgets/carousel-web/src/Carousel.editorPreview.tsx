import classNames from "classnames";
import { GUID } from "mendix";
import { ReactElement } from "react";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { CarouselPreviewProps } from "../typings/CarouselProps";
import { Carousel } from "./components/Carousel";

export function getPreviewCss(): string {
    return require("./ui/CarouselPreview.scss");
}

export function CarouselPreviewComponent(props: CarouselPreviewProps): ReactElement {
    const hasDataSource = props.dataSource != null;
    return (
        <Carousel
            id={generateUUID().toString()}
            className={classNames(props.className, "widget-carousel-editor-preview")}
            navigation={props.navigation}
            pagination={props.showPagination}
            loop={false}
            items={["1", "2"].map(item => ({
                id: item as GUID,
                content: hasDataSource ? (
                    <props.content.renderer>
                        <div className="carousel-item-content" />
                    </props.content.renderer>
                ) : (
                    <div className="carousel-item-content">
                        <div className="carousel-item-content-text">{`[No datasource selected]`}</div>
                    </div>
                )
            }))}
        />
    );
}

export function preview(props: CarouselPreviewProps): ReactElement {
    return <CarouselPreviewComponent {...props} />;
}
