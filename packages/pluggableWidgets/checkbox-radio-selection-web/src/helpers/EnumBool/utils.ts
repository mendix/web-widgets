import { DynamicValue, EditableValue, ValueStatus } from "mendix";
import { CheckboxRadioSelectionContainerProps } from "../../../typings/CheckboxRadioSelectionProps";

export function extractEnumerationProps(
    props: CheckboxRadioSelectionContainerProps
): [EditableValue<string | boolean>, DynamicValue<string>, boolean, "none"] {
    const attribute = props.optionsSourceType === "enumeration" ? props.attributeEnumeration : props.attributeBoolean;

    // For simplicity, we'll create a basic empty option
    const noOptions: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Checkbox Radio Selection controls don't need clearable like combobox does
    const clearable = false;

    // No filtering needed for radio buttons/checkboxes
    const filterType = "none" as const;

    return [attribute, noOptions, clearable, filterType];
}
