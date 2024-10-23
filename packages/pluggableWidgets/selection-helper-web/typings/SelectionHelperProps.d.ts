/**
 * This file was generated from SelectionHelper.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue } from "mendix";

export type RenderStyleEnum = "checkbox" | "custom";

export interface SelectionHelperContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    renderStyle: RenderStyleEnum;
    checkboxCaption?: DynamicValue<string>;
    customAllSelected: ReactNode;
    customSomeSelected: ReactNode;
    customNoneSelected: ReactNode;
}

export interface SelectionHelperPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    renderStyle: RenderStyleEnum;
    checkboxCaption: string;
    customAllSelected: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    customSomeSelected: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    customNoneSelected: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
}
