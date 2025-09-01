import { ActionValue, DynamicValue, EditableValue, ValueStatus } from "mendix";
import { Big } from "big.js";
import {
    CheckboxRadioSelectionContainerProps,
    OptionsSourceCustomContentTypeEnum,
    OptionsSourceStaticDataSourceType
} from "../../../typings/CheckboxRadioSelectionProps";

export function extractStaticProps(
    props: CheckboxRadioSelectionContainerProps
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
    const noOptions: DynamicValue<string> = {
        status: ValueStatus.Available,
        value: ""
    };

    // Checkbox Radio Selection controls don't need clearable like combobox does
    const clearable = false;

    const onChangeEvent = props.onChangeEvent;
    const customContentType = props.optionsSourceCustomContentType;

    return [attribute, ds, noOptions, clearable, onChangeEvent, customContentType];
}
