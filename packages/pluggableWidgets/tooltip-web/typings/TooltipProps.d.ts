/**
 * This file was generated from Tooltip.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue } from "mendix";

export type RenderMethodEnum = "text" | "custom";

export type TooltipPositionEnum = "left" | "right" | "top" | "bottom";

export type ArrowPositionEnum = "start" | "none" | "end";

export type OpenOnEnum = "click" | "hover" | "hoverFocus";

export interface TooltipContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    trigger: ReactNode;
    renderMethod: RenderMethodEnum;
    htmlMessage?: ReactNode;
    textMessage?: DynamicValue<string>;
    tooltipPosition: TooltipPositionEnum;
    arrowPosition: ArrowPositionEnum;
    openOn: OpenOnEnum;
}

export interface TooltipPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    trigger: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    renderMethod: RenderMethodEnum;
    htmlMessage: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    textMessage: string;
    tooltipPosition: TooltipPositionEnum;
    arrowPosition: ArrowPositionEnum;
    openOn: OpenOnEnum;
}
