import { ActionValue, EditableValue } from "mendix";

export interface ControllerProps {
    configurationOptions: string;
    dataAttribute?: EditableValue<string>;
    dataStatic: string;
    eventDataAttribute?: EditableValue<string>;
    layoutAttribute?: EditableValue<string>;
    layoutStatic: string;
    onClick?: ActionValue;
    sampleData: string;
    sampleLayout: string;
}
