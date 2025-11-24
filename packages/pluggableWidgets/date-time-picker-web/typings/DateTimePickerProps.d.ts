/**
 * This file was generated from DateTimePicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type TypeEnum = "date" | "time" | "range" | "datetime";

export type EditableEnum = "default" | "never" | "conditionally";

export type ReadOnlyStyleEnum = "default" | "control" | "text";

export type ValidationTypeEnum = "none" | "required" | "future" | "past" | "custom";

export interface DateTimePickerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    type: TypeEnum;
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    placeholder?: DynamicValue<string>;
    dateAttribute: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    showLabel: boolean;
    label?: DynamicValue<string>;
    editable: EditableEnum;
    editabilityCondition?: DynamicValue<boolean>;
    readOnlyStyle: ReadOnlyStyleEnum;
    visible?: DynamicValue<boolean>;
    validationType: ValidationTypeEnum;
    customValidation?: DynamicValue<boolean>;
    validationMessage?: DynamicValue<string>;
    ariaRequired: boolean;
    onChange?: ActionValue;
    onEnter?: ActionValue;
    onLeave?: ActionValue;
}

export interface DateTimePickerPreviewProps {
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
    type: TypeEnum;
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    placeholder: string;
    dateAttribute: string;
    endDateAttribute: string;
    showLabel: boolean;
    label: string;
    editable: EditableEnum;
    editabilityCondition: string;
    readOnlyStyle: ReadOnlyStyleEnum;
    visible: string;
    validationType: ValidationTypeEnum;
    customValidation: string;
    validationMessage: string;
    ariaRequired: boolean;
    onChange: {} | null;
    onEnter: {} | null;
    onLeave: {} | null;
}
