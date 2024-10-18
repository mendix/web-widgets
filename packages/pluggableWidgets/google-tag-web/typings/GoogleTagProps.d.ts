/**
 * This file was generated from GoogleTag.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue } from "mendix";

export type WidgetModeEnum = "basic" | "advanced";

export type ValueTypeEnum = "predefined" | "custom";

export type PredefinedValueEnum = "pageTitle" | "pageUrl" | "pageName" | "moduleName" | "pageAndModuleName" | "sessionId" | "userLocale";

export interface ParametersType {
    name: string;
    valueType: ValueTypeEnum;
    predefinedValue: PredefinedValueEnum;
    customValue?: DynamicValue<string>;
}

export type CommandEnum = "event" | "config";

export interface ParametersPreviewType {
    name: string;
    valueType: ValueTypeEnum;
    predefinedValue: PredefinedValueEnum;
    customValue: string;
}

export interface GoogleTagContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    widgetMode: WidgetModeEnum;
    targetId?: DynamicValue<string>;
    parameters: ParametersType[];
    sendUserID: boolean;
    command: CommandEnum;
    eventName: string;
    trackPageChanges: boolean;
}

export interface GoogleTagPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    widgetMode: WidgetModeEnum;
    targetId: string;
    parameters: ParametersPreviewType[];
    sendUserID: boolean;
    command: CommandEnum;
    eventName: string;
    trackPageChanges: boolean;
}
