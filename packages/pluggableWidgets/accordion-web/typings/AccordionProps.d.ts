/**
 * This file was generated from Accordion.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue, EditableValue, WebIcon } from "mendix";

export type HeaderRenderModeEnum = "text" | "custom";

export type HeaderHeadingEnum = "headingOne" | "headingTwo" | "headingThree" | "headingFour" | "headingFive" | "headingSix";

export type LoadContentEnum = "always" | "whenExpanded";

export type InitialCollapsedStateEnum = "expanded" | "collapsed" | "dynamic";

export interface GroupsType {
    headerRenderMode: HeaderRenderModeEnum;
    headerText: DynamicValue<string>;
    headerHeading: HeaderHeadingEnum;
    headerContent?: ReactNode;
    content?: ReactNode;
    visible: DynamicValue<boolean>;
    dynamicClass?: DynamicValue<string>;
    loadContent: LoadContentEnum;
    initialCollapsedState: InitialCollapsedStateEnum;
    initiallyCollapsed: DynamicValue<boolean>;
    collapsed?: EditableValue<boolean>;
}

export type ExpandBehaviorEnum = "singleExpanded" | "multipleExpanded";

export type ShowIconEnum = "right" | "left" | "no";

export interface GroupsPreviewType {
    headerRenderMode: HeaderRenderModeEnum;
    headerText: string;
    headerHeading: HeaderHeadingEnum;
    headerContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    visible: string;
    dynamicClass: string;
    loadContent: LoadContentEnum;
    initialCollapsedState: InitialCollapsedStateEnum;
    initiallyCollapsed: string;
    collapsed: string;
    onToggleCollapsed: {} | null;
}

export interface AccordionContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advancedMode: boolean;
    groups: GroupsType[];
    collapsible: boolean;
    expandBehavior: ExpandBehaviorEnum;
    animate: boolean;
    showIcon: ShowIconEnum;
    icon?: DynamicValue<WebIcon>;
    expandIcon?: DynamicValue<WebIcon>;
    collapseIcon?: DynamicValue<WebIcon>;
    animateIcon: boolean;
}

export interface AccordionPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    advancedMode: boolean;
    groups: GroupsPreviewType[];
    collapsible: boolean;
    expandBehavior: ExpandBehaviorEnum;
    animate: boolean;
    showIcon: ShowIconEnum;
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    expandIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    collapseIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    animateIcon: boolean;
}
