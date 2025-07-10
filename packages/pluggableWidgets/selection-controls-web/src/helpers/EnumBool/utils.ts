import { DynamicValue, EditableValue, ValueStatus } from "mendix";
import { SelectionControlsContainerProps } from "../../../typings/SelectionControlsProps";

export function extractEnumerationProps(
    props: SelectionControlsContainerProps
): [EditableValue<string | boolean>, DynamicValue<string>, boolean, "none"] {
    const attribute = props.optionsSourceType === "enumeration" ? props.attributeEnumeration : props.attributeBoolean;

    // For simplicity, we'll create a basic empty option
    const emptyOption: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Selection controls don't need clearable like combobox does
    const clearable = false;

    // No filtering needed for radio buttons/checkboxes
    const filterType = "none" as const;

    return [attribute, emptyOption, clearable, filterType];
}
