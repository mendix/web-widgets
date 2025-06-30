import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useEffect } from "react";
import { EnumComboboxController } from "../controllers/EnumComboboxController";
import { EnumSelectController } from "../controllers/EnumSelectController";
import { EnumTagPickerController } from "../controllers/EnumTagPickerController";
import { Combobox } from "../controls/combobox/Combobox";
import { Select } from "../controls/select/Select";
import { TagPicker } from "../controls/tag-picker/TagPicker";
import { useFrontendType } from "../helpers/useFrontendType";
import { usePickerJSActions } from "../helpers/usePickerJSActions";
import { withCustomOptionsGuard } from "../hocs/withCustomOptionsGuard";
import { EnumFilterStore } from "../stores/EnumFilterStore";
import { FilterOptionsType, SelectedItemsStyleEnum, SelectionMethodEnum } from "../typings/widget";

export interface EnumFilterContainerProps {
    ariaLabel?: string;
    className?: string;
    defaultValue?: string;
    emptyOptionCaption: string;
    emptySelectionCaption: string;
    placeholder: string;
    filterOptions: FilterOptionsType[];
    filterStore: EnumFilterStore;
    multiselect: boolean;
    name: string;
    onChange?: ActionValue;
    parentChannelName: string | undefined;
    styles?: CSSProperties;
    valueAttribute?: EditableValue<string>;
    filterable: boolean;
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    clearable: boolean;
}

function Container(props: EnumFilterContainerProps): React.ReactElement {
    const frontendType = useFrontendType(props);

    switch (frontendType) {
        case "select":
            return <SelectWidget {...props} />;
        case "combobox":
            return <ComboboxWidget {...props} />;
        case "tagPicker":
            return <TagPickerWidget {...props} />;
        default:
            return <div>Unknown frontend type: {frontendType}</div>;
    }
}

const SelectWidget = observer(function SelectWidget(props: EnumFilterContainerProps): React.ReactElement {
    const gate = useGate(props);
    const ctrl1 = useSetup(() => new EnumSelectController({ gate }));

    usePickerJSActions(ctrl1, props);

    return (
        <Select
            value={ctrl1.value}
            useSelectProps={ctrl1.useSelectProps}
            options={ctrl1.options}
            onClear={ctrl1.handleClear}
            clearable={props.clearable}
            empty={ctrl1.isEmpty}
            showCheckboxes={ctrl1.multiselect}
            className={props.className}
            style={props.styles}
        />
    );
});

const ComboboxWidget = observer(function ComboboxWidget(props: EnumFilterContainerProps): React.ReactElement {
    const gate = useGate(props);
    const ctrl2 = useSetup(() => new EnumComboboxController({ gate }));

    usePickerJSActions(ctrl2, props);

    return (
        <Combobox
            options={ctrl2.options}
            inputPlaceholder={ctrl2.inputPlaceholder}
            emptyCaption={ctrl2.emptyCaption}
            useComboboxProps={ctrl2.useComboboxProps}
            onClear={ctrl2.handleClear}
            onFocus={ctrl2.handleFocus}
            onBlur={ctrl2.handleBlur}
            empty={ctrl2.isEmpty}
            className={props.className}
            style={props.styles}
        />
    );
});

const TagPickerWidget = observer(function TagPickerWidget(props: EnumFilterContainerProps): React.ReactElement {
    const gate = useGate(props);
    const ctrl3 = useSetup(() => new EnumTagPickerController({ gate }));

    usePickerJSActions(ctrl3, props);

    return (
        <TagPicker
            options={ctrl3.options}
            selected={ctrl3.selectedOptions}
            useMultipleSelectionProps={ctrl3.useMultipleSelectionProps}
            useComboboxProps={ctrl3.useComboboxProps}
            onClear={ctrl3.handleClear}
            onBlur={ctrl3.handleBlur}
            inputPlaceholder={ctrl3.inputPlaceholder}
            emptyCaption={ctrl3.emptyCaption}
            empty={ctrl3.isEmpty}
            showCheckboxes={props.selectionMethod === "checkbox"}
            selectedStyle={props.selectedItemsStyle}
            className={props.className}
            style={props.styles}
        />
    );
});

export const EnumFilterContainer = withCustomOptionsGuard(Container);

function useGate(props: EnumFilterContainerProps): DerivedPropsGate<EnumFilterContainerProps> {
    const gp = useConst(() => new GateProvider(props));
    useEffect(() => gp.setProps(props));
    return gp.gate;
}
