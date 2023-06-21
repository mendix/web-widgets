import { ComboboxContainerProps } from "../../../typings/ComboboxProps";

export function extractEnumerationProps(props: ComboboxContainerProps) {
    const attr = props.attributeEnumeration ?? props.attributeBoolean;
    const emptyOption = props.emptyOptionText;
    const clearable = props.clearable;
    if (!attr) {
        throw new Error(
            "'optionsSourceType' type is 'enumeration' or 'boolean' but 'attributeEnumeration' or 'attributeBoolean' is not defined."
        );
    }

    return [attr, emptyOption, clearable] as const;
}
