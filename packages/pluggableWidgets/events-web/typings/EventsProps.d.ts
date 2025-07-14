/**
 * This file was generated from Events.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { Big } from "big.js";

export type ComponentLoadDelayParameterTypeEnum = "number" | "expression";

export type ComponentLoadRepeatParameterTypeEnum = "number" | "expression";

export type OnEventChangeDelayParameterTypeEnum = "number" | "expression";

export interface EventsContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    onComponentLoad?: ActionValue;
    componentLoadDelayParameterType: ComponentLoadDelayParameterTypeEnum;
    componentLoadDelayInteger: number;
    componentLoadDelayExpression: DynamicValue<Big>;
    componentLoadRepeat: boolean;
    componentLoadRepeatParameterType: ComponentLoadRepeatParameterTypeEnum;
    componentLoadRepeatInterval: number;
    componentLoadRepeatExpression?: DynamicValue<Big>;
    onEventChangeAttribute?: EditableValue<Big | any | boolean | Date | string>;
    onEventChange?: ActionValue;
    onEventChangeDelayParameterType: OnEventChangeDelayParameterTypeEnum;
    onEventChangeDelayInteger: number;
    onEventChangeDelayExpression?: DynamicValue<Big>;
}

export interface EventsPreviewProps {
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
    onComponentLoad: {} | null;
    componentLoadDelayParameterType: ComponentLoadDelayParameterTypeEnum;
    componentLoadDelayInteger: number | null;
    componentLoadDelayExpression: string;
    componentLoadRepeat: boolean;
    componentLoadRepeatParameterType: ComponentLoadRepeatParameterTypeEnum;
    componentLoadRepeatInterval: number | null;
    componentLoadRepeatExpression: string;
    onEventChangeAttribute: string;
    onEventChange: {} | null;
    onEventChangeDelayParameterType: OnEventChangeDelayParameterTypeEnum;
    onEventChangeDelayInteger: number | null;
    onEventChangeDelayExpression: string;
}
