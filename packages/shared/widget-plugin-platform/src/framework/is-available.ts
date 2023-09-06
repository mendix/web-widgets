import { DynamicValue, EditableValue } from "mendix";

export const isAvailable = (property: DynamicValue<any> | EditableValue<any>): boolean => {
    return property && property.status === "available" && property.value;
};
