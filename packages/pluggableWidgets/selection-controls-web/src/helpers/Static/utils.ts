import { ActionValue, DynamicValue, EditableValue, ValueStatus } from "mendix";
import { Big } from "big.js";
import {
    SelectionControlsContainerProps,
    OptionsSourceCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/SelectionControlsProps";

export function extractStaticProps(
    props: SelectionControlsContainerProps
): [
    EditableValue<string | Big | boolean | Date>,
    OptionsSourceStaticDataSourceType[],
    DynamicValue<string>,
    boolean,
    ActionValue | undefined,
    OptionsSourceCustomContentTypeEnum
] {
    const attribute = props.staticAttribute;
    const ds = props.optionsSourceStaticDataSource;

    // For simplicity, we'll create a basic empty option
    const emptyOption: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Selection controls don't need clearable like combobox does
    const clearable = false;

    const onChangeEvent = props.onChangeEvent;
    const customContentType = props.optionsSourceCustomContentType;

    return [attribute, ds, emptyOption, clearable, onChangeEvent, customContentType];
}
