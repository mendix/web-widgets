/**
 * This file was generated from AppTranslationsProvider.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ListValue, ListAttributeValue } from "mendix";

export interface AppTranslationsProviderContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    data: ListValue;
    langAttr: ListAttributeValue<string>;
    children: ReactNode;
}

export interface AppTranslationsProviderPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    data: {} | { caption: string } | { type: string } | null;
    langAttr: string;
    children: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
}
