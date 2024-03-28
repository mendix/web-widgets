import { ActionValue, DynamicValue, EditableValue } from "mendix";
import {
    ComboboxContainerProps,
    OptionsSourceStaticDataSourceType,
    FilterTypeEnum,
    StaticDataSourceCustomContentTypeEnum
} from "../../../typings/ComboboxProps";

type ExtractionReturnValue = [
    EditableValue<string | Big | boolean | Date>,
    OptionsSourceStaticDataSourceType[],
    DynamicValue<string> | undefined,
    boolean,
    FilterTypeEnum,
    ActionValue | undefined,
    StaticDataSourceCustomContentTypeEnum
];

export function extractStaticProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const attr = props.staticAttribute;
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
    const clearable = typeof props.staticAttribute.value === "boolean" ? false : props.clearable;
    const customContentType = props.staticDataSourceCustomContentType;

    return [attr, ds, emptyOption, clearable, filterType, onChangeEvent, customContentType];
}
