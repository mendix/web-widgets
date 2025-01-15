import { StaticSelectController } from "@mendix/widget-plugin-filtering/controllers/picker/StaticSelectController";
import { StaticComboboxController } from "@mendix/widget-plugin-filtering/controllers/picker/StaticComboboxController";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";
import { Combobox } from "@mendix/widget-plugin-filtering/controls/combobox/Combobox";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useState } from "react";
import { FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { withCustomOptionsGuard } from "../hocs/withCustomOptionsGuard";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/StaticSelectFilterStore";
import { StaticTagPickerController } from "@mendix/widget-plugin-filtering/controllers/picker/StaticTagPickerController";
import { TagPicker } from "@mendix/widget-plugin-filtering/controls/tag-picker/TagPicker";
import { useSetup } from "@mendix/widget-plugin-filtering/helpers/useSetup";
import { usePickerJSActions } from "@mendix/widget-plugin-filtering/helpers/usePickerJSActions";

export interface StaticFilterContainerProps {
    parentChannelName: string | undefined;
    name: string;
    filterStore: StaticSelectFilterStore;
    filterOptions: FilterOptionsType[];
    multiselect: boolean;
    defaultValue?: string;
    ariaLabel?: string;
    className?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    onChange?: ActionValue;
    emptyCaption?: string;
    valueAttribute?: EditableValue<string>;
}

function Container(props: StaticFilterContainerProps): React.ReactElement {
    const USE_SELECT = true;
    const USE_COMBOBOX = true;

    if (USE_SELECT) {
        return <SelectWidget {...props} />;
    }

    if (USE_COMBOBOX) {
        return <ComboboxWidget {...props} />;
    }

    return <MultiboxWidget {...props} />;
}

// eslint-disable-next-line prefer-arrow-callback
const SelectWidget = observer(function SelectWidget(props: StaticFilterContainerProps): React.ReactElement {
    const ctrl2 = useSetup(() => new StaticSelectController(props));

    usePickerJSActions(ctrl2, props);

    return (
        <Select
            value={ctrl2.value}
            useSelectProps={ctrl2.useSelectProps}
            options={ctrl2.options}
            onClear={ctrl2.handleClear}
            clearable
        />
    );
});

// eslint-disable-next-line prefer-arrow-callback
const ComboboxWidget = observer(function ComboboxWidget(props: StaticFilterContainerProps): React.ReactElement {
    const ctrl3 = useSetup(() => new StaticComboboxController(props));

    usePickerJSActions(ctrl3, props);

    return (
        <Combobox
            options={ctrl3.options}
            inputPlaceholder={ctrl3.inputPlaceholder}
            useComboboxProps={ctrl3.useComboboxProps}
            onClear={ctrl3.handleClear}
            onFocus={ctrl3.handleFocus}
            onBlur={ctrl3.handleBlur}
            empty={ctrl3.isEmpty}
        />
    );
});

function MultiboxWidget(props: StaticFilterContainerProps): React.ReactElement {
    const [ctrl4] = useState(() => new StaticTagPickerController({ filterStore: props.filterStore }));

    // usePickerJSActions(ctrl4, props);

    return (
        <TagPicker
            options={ctrl4.options}
            selectedItems={ctrl4.selectedItems}
            useMultipleSelectionProps={ctrl4.useMultipleSelectionProps}
            useComboboxProps={ctrl4.useComboboxProps}
            onClear={ctrl4.handleClear}
            onBlur={ctrl4.handleBlur}
            inputPlaceholder={ctrl4.inputPlaceholder}
        />
    );
}

export const StaticFilterContainer = withCustomOptionsGuard(Container);
