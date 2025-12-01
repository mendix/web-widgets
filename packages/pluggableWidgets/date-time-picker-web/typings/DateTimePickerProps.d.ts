/**
 * This file was generated from DateTimePicker.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type TypeEnum = "date" | "time" | "range" | "datetime";

export type ValidationTypeEnum = "none" | "required" | "custom";

export interface DateTimePickerContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    type: TypeEnum;
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    placeholder?: DynamicValue<string>;
    dateAttribute: EditableValue<Date>;
    endDateAttribute?: EditableValue<Date>;
    validationType: ValidationTypeEnum;
    customValidation?: DynamicValue<boolean>;
    validationMessage?: DynamicValue<string>;
    ariaRequired: boolean;
    onChange?: ActionValue;
    onEnter?: ActionValue;
    onLeave?: ActionValue;
}

export interface DateTimePickerPreviewProps {
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
    validationType: ValidationTypeEnum;
    customValidation: string;
    validationMessage: string;
    ariaRequired: boolean;
    onChange: {} | null;
    onEnter: {} | null;
    onLeave: {} | null;
}
