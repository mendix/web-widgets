/**
 * This file was generated from GoogleTag.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue } from "mendix";

export type CommandEnum = "config" | "event" | "set";

export interface ParametersType {
    name: string;
    value: DynamicValue<string>;
}

export type SendEventsOnEnum = "onRender" | "onNavigation";

export interface ParametersPreviewType {
    name: string;
    value: string;
}

export interface GoogleTagContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    command: CommandEnum;
    targetId?: DynamicValue<string>;
    eventName: string;
    parameters: ParametersType[];
    sendEventsOn: SendEventsOnEnum;
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
    command: CommandEnum;
    targetId: string;
    eventName: string;
    parameters: ParametersPreviewType[];
    sendEventsOn: SendEventsOnEnum;
}
