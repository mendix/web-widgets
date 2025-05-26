import { DynamicValue, EditableValue } from "mendix";
import { ComboboxContainerProps, FilterTypeEnum } from "../../../typings/ComboboxProps";

type ExtractionReturnValue = [EditableValue<string>, DynamicValue<string> | undefined, boolean, FilterTypeEnum];

export function extractEnumerationProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const attr = props.attributeEnumeration ?? props.attributeBoolean;
    const emptyOption = props.emptyOptionText;
    const clearable = props.clearable;
    const filterType = props.filterType;

    if (!attr) {
        throw new Error(
            "'optionsSourceType' type is 'enumeration' or 'boolean' but 'attributeEnumeration' or 'attributeBoolean' is not defined."
        );
    }

    return [attr, emptyOption, clearable, filterType];
}
