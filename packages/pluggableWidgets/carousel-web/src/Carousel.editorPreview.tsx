import classNames from "classnames";
import { CSSProperties, ReactElement } from "react";
import { CarouselPreviewProps } from "../typings/CarouselProps";

export function getPreviewCss(): string {
    return require("./ui/CarouselPreview.scss");
}

// Static preview: Swiper needs a live DOM to initialize, which the Studio Pro page editor does not provide.
export function CarouselPreviewComponent(props: CarouselPreviewProps): ReactElement {
    const hasDataSource = props.dataSource != null;
    const slidesPerView = Math.max(1, props.slidesPerView ?? 1);
    const slides = Array.from({ length: slidesPerView }, (_, index) => index);

    return (
        <div
            className={classNames(props.className, "widget-carousel", "widget-carousel-editor-preview")}
            style={{ "--carousel-preview-slides-per-view": slidesPerView } as CSSProperties}
        >
            <div className="widget-carousel-preview-viewport">
                {props.navigation && <span className="widget-carousel-preview-nav widget-carousel-preview-prev" />}
                <ul className="widget-carousel-preview-slides">
                    {slides.map(index => (
                        <li key={index} className="widget-carousel-preview-slide">
                            {hasDataSource ? (
                                <props.content.renderer>
                                    <div className="carousel-item-content" />
                                </props.content.renderer>
                            ) : (
                                <div className="carousel-item-content">
                                    <div className="carousel-item-content-text">[No datasource selected]</div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {props.navigation && <span className="widget-carousel-preview-nav widget-carousel-preview-next" />}
            </div>
            {props.showPagination && (
                <div className="widget-carousel-preview-pagination">
                    <span className="widget-carousel-preview-bullet widget-carousel-preview-bullet-active" />
                    <span className="widget-carousel-preview-bullet" />
                    <span className="widget-carousel-preview-bullet" />
                </div>
            )}
        </div>
    );
}

export function preview(props: CarouselPreviewProps): ReactElement {
    return <CarouselPreviewComponent {...props} />;
}
