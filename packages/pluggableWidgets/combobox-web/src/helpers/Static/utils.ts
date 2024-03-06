import { ActionValue, DynamicValue, EditableValue, ListWidgetValue } from "mendix";
import {
    ComboboxContainerProps,
    OptionsSourceStaticDataSourceType,
    FilterTypeEnum,
    OptionsSourceAssociationCustomContentTypeEnum
} from "../../../typings/ComboboxProps";

type ExtractionReturnValue = [
    EditableValue<string | Big>,
    OptionsSourceStaticDataSourceType[],
    DynamicValue<string> | undefined,
    boolean,
    FilterTypeEnum,
    ActionValue | undefined,
    ListWidgetValue | undefined,
    OptionsSourceAssociationCustomContentTypeEnum
];

export function extractStaticProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const attr = props.staticAttributeString;
    const filterType = props.filterType;
    const onChangeEvent = props.onChangeEvent;

    if (!attr) {
        throw new Error("'optionsSourceType' type is 'Database' but 'databaseAttributeString' is not defined.");
    }

    const ds = props.optionsSourceStaticDataSource;
    if (!ds) {
        throw new Error("'optionsSourceType' type is 'database' but 'optionsSourceStaticDataSource' is not defined.");
    }
    const emptyOption = props.emptyOptionText;
    const clearable = props.clearable;
    const customContent = props.optionsSourceAssociationCustomContent;
    const customContentType = props.optionsSourceAssociationCustomContentType;

    return [attr, ds, emptyOption, clearable, filterType, onChangeEvent, customContent, customContentType];
}
