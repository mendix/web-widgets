import Big from "big.js";
import { EditableValue, ListAttributeValue } from "mendix";
import { ComboboxContainerProps } from "../../../typings/ComboboxProps";

export function getReadonly(
    targetAttribute: EditableValue<string | Big> | undefined,
    customEditability: ComboboxContainerProps["customEditability"],
    customEditabilityExpression: ComboboxContainerProps["customEditabilityExpression"]
): boolean {
    if (targetAttribute?.readOnly) {
        return true;
    }
    if (customEditability === "never") {
        return true;
    }
    if (customEditability === "conditionally" && customEditabilityExpression.value !== true) {
        return true;
    }
    return false;
}

/** Studio Pro cannot check that the bound attribute and the value attribute have compatible types. */
export function assertCompatibleTypes(
    targetAttribute: EditableValue<string | Big>,
    valueAttribute: ListAttributeValue<string | Big> | undefined
): void {
    const type = valueAttribute?.type;
    if (targetAttribute.value instanceof Big && type !== "Integer" && type !== "Long" && type !== "Enum") {
        throw new Error(`Target attribute is of type Number while Value attribute is of type ${type}`);
    }
    if (typeof targetAttribute.value === "string" && type !== "String" && type !== "Enum") {
        throw new Error(`Target attribute is of type String while Value attribute is of type ${type}`);
    }
}
