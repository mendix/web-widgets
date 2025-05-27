import { StaticSelectController } from "@mendix/widget-plugin-filtering/controllers/picker/StaticSelectController";
import { StaticComboboxController } from "@mendix/widget-plugin-filtering/controllers/picker/StaticComboboxController";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";
import { Combobox } from "@mendix/widget-plugin-filtering/controls/combobox/Combobox";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties } from "react";
import { FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { withCustomOptionsGuard } from "../hocs/withCustomOptionsGuard";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/StaticSelectFilterStore";
import { StaticTagPickerController } from "@mendix/widget-plugin-filtering/controllers/picker/StaticTagPickerController";
import { TagPicker } from "@mendix/widget-plugin-filtering/controls/tag-picker/TagPicker";
import { useSetupUpdate } from "@mendix/widget-plugin-filtering/helpers/useSetupUpdate";
import { usePickerJSActions } from "@mendix/widget-plugin-filtering/helpers/usePickerJSActions";

export interface StaticFilterContainerProps {
    ariaLabel?: string;
    className?: string;
    defaultValue?: string;
    emptyCaption?: string;
    filterOptions: FilterOptionsType[];
    filterStore: StaticSelectFilterStore;
    multiselect: boolean;
    name: string;
    onChange?: ActionValue;
    parentChannelName: string | undefined;
    styles?: CSSProperties;
    valueAttribute?: EditableValue<string>;
}

function Container(props: StaticFilterContainerProps): React.ReactElement {
    const isSelect = false;
    const isCombobox = false;

    if (isSelect) {
        return <SelectWidget {...props} />;
    }

    if (isCombobox) {
        return <ComboboxWidget {...props} />;
    }

    return <TagPickerWidget {...props} />;
}

// eslint-disable-next-line prefer-arrow-callback
const SelectWidget = observer(function SelectWidget(props: StaticFilterContainerProps): React.ReactElement {
    const ctrl1 = useSetupUpdate(() => new StaticSelectController(props), props);

    usePickerJSActions(ctrl1, props);

    return (
        <Select
            value={ctrl1.value}
            useSelectProps={ctrl1.useSelectProps}
            options={ctrl1.options}
            onClear={ctrl1.handleClear}
            clearable
            empty={ctrl1.isEmpty}
        />
    );
});

// eslint-disable-next-line prefer-arrow-callback
const ComboboxWidget = observer(function ComboboxWidget(props: StaticFilterContainerProps): React.ReactElement {
    const ctrl2 = useSetupUpdate(() => new StaticComboboxController(props), props);

    usePickerJSActions(ctrl2, props);

    return (
        <Combobox
            options={ctrl2.options}
            inputPlaceholder={ctrl2.inputPlaceholder}
            useComboboxProps={ctrl2.useComboboxProps}
            onClear={ctrl2.handleClear}
            onFocus={ctrl2.handleFocus}
            onBlur={ctrl2.handleBlur}
            empty={ctrl2.isEmpty}
        />
    );
});

// eslint-disable-next-line prefer-arrow-callback
const TagPickerWidget = observer(function TagPickerWidget(props: StaticFilterContainerProps): React.ReactElement {
    const ctrl3 = useSetupUpdate(() => new StaticTagPickerController(props), props);

    usePickerJSActions(ctrl3, props);

    return (
        <TagPicker
            options={ctrl3.options}
            selectedItems={ctrl3.selectedItems}
            useMultipleSelectionProps={ctrl3.useMultipleSelectionProps}
            useComboboxProps={ctrl3.useComboboxProps}
            onClear={ctrl3.handleClear}
            onBlur={ctrl3.handleBlur}
            inputPlaceholder={ctrl3.inputPlaceholder}
            empty={ctrl3.isEmpty}
            showCheckboxes={false}
            selectedStyle="text"
        />
    );
});

export const StaticFilterContainer = withCustomOptionsGuard(Container);
