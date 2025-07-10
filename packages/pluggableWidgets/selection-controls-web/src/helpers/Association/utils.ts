import {
    ActionValue,
    DynamicValue,
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ListWidgetValue,
    ReferenceSetValue,
    ReferenceValue,
    ValueStatus
} from "mendix";
import {
    SelectionControlsContainerProps,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/SelectionControlsProps";

export function extractAssociationProps(
    props: SelectionControlsContainerProps
): [
    ReferenceValue | ReferenceSetValue,
    ListValue,
    ListAttributeValue<string> | ListExpressionValue<string>,
    DynamicValue<string>,
    boolean,
    ActionValue | undefined,
    ListWidgetValue | undefined,
    OptionsSourceAssociationCustomContentTypeEnum
] {
    const attr = props.attributeAssociation;
    const ds = props.optionsSourceAssociationDataSource!;

    // Determine caption provider based on caption type
    const captionProvider =
        props.optionsSourceAssociationCaptionType === "attribute"
            ? props.optionsSourceAssociationCaptionAttribute!
            : props.optionsSourceAssociationCaptionExpression!;

    // For simplicity, we'll create a basic empty option
    const emptyOption: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Selection controls don't need clearable like combobox does
    const clearable = false;

    const onChangeEvent = props.onChangeEvent;
    const customContent = props.optionsSourceAssociationCustomContent;
    const customContentType = props.optionsSourceAssociationCustomContentType;

    return [attr, ds, captionProvider, emptyOption, clearable, onChangeEvent, customContent, customContentType];
}
