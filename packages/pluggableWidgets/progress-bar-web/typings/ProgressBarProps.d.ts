/**
 * This file was generated from ProgressBar.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import { Big } from "big.js";

export type TypeEnum = "static" | "dynamic" | "expression";

export type LabelTypeEnum = "text" | "percentage" | "custom";

export interface ProgressBarContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    type: TypeEnum;
    staticCurrentValue: number;
    dynamicCurrentValue?: EditableValue<Big>;
    expressionCurrentValue?: DynamicValue<Big>;
    staticMinValue: number;
    dynamicMinValue?: EditableValue<Big>;
    expressionMinValue?: DynamicValue<Big>;
    staticMaxValue: number;
    dynamicMaxValue?: EditableValue<Big>;
    expressionMaxValue?: DynamicValue<Big>;
    onClick?: ActionValue;
    showLabel: boolean;
    labelType: LabelTypeEnum;
    labelText?: DynamicValue<string>;
    customLabel?: ReactNode;
}

export interface ProgressBarPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    type: TypeEnum;
    staticCurrentValue: number | null;
    dynamicCurrentValue: string;
    expressionCurrentValue: string;
    staticMinValue: number | null;
    dynamicMinValue: string;
    expressionMinValue: string;
    staticMaxValue: number | null;
    dynamicMaxValue: string;
    expressionMaxValue: string;
    onClick: {} | null;
    showLabel: boolean;
    labelType: LabelTypeEnum;
    labelText: string;
    customLabel: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
}
