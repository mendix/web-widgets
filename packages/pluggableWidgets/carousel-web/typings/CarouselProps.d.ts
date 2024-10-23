/**
 * This file was generated from Carousel.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, ListValue, ListWidgetValue } from "mendix";

export interface CarouselContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource?: ListValue;
    content?: ListWidgetValue;
    showPagination: boolean;
    navigation: boolean;
    autoplay: boolean;
    delay: number;
    loop: boolean;
    animation: boolean;
    onClickAction?: ActionValue;
}

export interface CarouselPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    dataSource: {} | { caption: string } | { type: string } | null;
    content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    showPagination: boolean;
    navigation: boolean;
    autoplay: boolean;
    delay: number | null;
    loop: boolean;
    animation: boolean;
    onClickAction: {} | null;
}
