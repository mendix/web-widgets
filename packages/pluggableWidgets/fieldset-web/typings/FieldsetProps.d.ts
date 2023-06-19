/**
 * This file was generated from Fieldset.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue } from "mendix";

export interface FieldsetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    legend?: DynamicValue<string>;
    content: ReactNode;
}

export interface FieldsetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    legend: string;
    content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
}
