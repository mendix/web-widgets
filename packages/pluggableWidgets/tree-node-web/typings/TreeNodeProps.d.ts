/**
 * This file was generated from TreeNode.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue, ListValue, ListExpressionValue, ListWidgetValue, WebIcon } from "mendix";

export type HeaderTypeEnum = "text" | "custom";

export type OpenNodeOnEnum = "headerClick" | "iconClick";

export type ShowIconEnum = "left" | "right" | "no";

export interface TreeNodeContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advancedMode: boolean;
    datasource: ListValue;
    headerType: HeaderTypeEnum;
    openNodeOn: OpenNodeOnEnum;
    headerContent?: ListWidgetValue;
    headerCaption?: ListExpressionValue<string>;
    hasChildren: boolean;
    startExpanded: boolean;
    children?: ListWidgetValue;
    animate: boolean;
    showIcon: ShowIconEnum;
    expandedIcon?: DynamicValue<WebIcon>;
    collapsedIcon?: DynamicValue<WebIcon>;
    animateIcon: boolean;
}

export interface TreeNodePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    advancedMode: boolean;
    datasource: {} | { caption: string } | { type: string } | null;
    headerType: HeaderTypeEnum;
    openNodeOn: OpenNodeOnEnum;
    headerContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    headerCaption: string;
    hasChildren: boolean;
    startExpanded: boolean;
    children: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    animate: boolean;
    showIcon: ShowIconEnum;
    expandedIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    collapsedIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    animateIcon: boolean;
}
