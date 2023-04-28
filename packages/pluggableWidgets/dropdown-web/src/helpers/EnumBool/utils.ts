import { DropdownContainerProps } from "../../../typings/DropdownProps";

export function extractEnumerationProps(props: DropdownContainerProps) {
    const attr = props.attributeEnumerationOrBoolean;
    const emptyOption = props.emptyOptionText;
    const clearable = props.clearable;
    if (!attr) {
        throw new Error(
            "'optionsSourceType' type is 'enumerationOrBoolean' but 'attributeEnumerationOrBoolean' is not defined."
        );
    }

    return [attr, emptyOption, clearable] as const;
}
