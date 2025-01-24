import { RefSelectController } from "@mendix/widget-plugin-filtering/controllers/picker/RefSelectController";
import { RefComboboxController } from "@mendix/widget-plugin-filtering/controllers/picker/RefComboboxController";
import { RefTagPickerController } from "@mendix/widget-plugin-filtering/controllers/picker/RefTagPickerController";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";
import { Combobox } from "@mendix/widget-plugin-filtering/controls/combobox/Combobox";
import { TagPicker } from "@mendix/widget-plugin-filtering/controls/tag-picker/TagPicker";
import { usePickerJSActions } from "@mendix/widget-plugin-filtering/helpers/usePickerJSActions";
import { RefFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/RefFilterStore";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties } from "react";
import { useSetupUpdate } from "@mendix/widget-plugin-filtering/helpers/useSetupUpdate";
import { useFrontendType } from "../hooks/useFrontendType";
import { SelectedItemsStyleEnum, SelectionMethodEnum } from "../../typings/DatagridDropdownFilterProps";
import { useOnScrollBottom } from "@mendix/widget-plugin-hooks/useOnScrollBottom";

export interface RefFilterContainerProps {
    ariaLabel?: string;
    className?: string;
    defaultValue?: string;
    emptyCaption?: string;
    filterStore: RefFilterStore;
    multiselect: boolean;
    name: string;
    onChange?: ActionValue;
    parentChannelName?: string;
    styles?: CSSProperties;
    valueAttribute?: EditableValue<string>;
    filterable: boolean;
    selectionMethod: SelectionMethodEnum;
    selectedItemsStyle: SelectedItemsStyleEnum;
    clearable: boolean;
}

function Container(props: RefFilterContainerProps): React.ReactElement {
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

// eslint-disable-next-line prefer-arrow-callback
const SelectWidget = observer(function SelectWidget(props: RefFilterContainerProps): React.ReactElement {
    const ctrl1 = useSetupUpdate(() => new RefSelectController(props), props);
    const handleMenuScroll = useOnScrollBottom(ctrl1.handleMenuScrollEnd, { triggerZoneHeight: 100 });

    usePickerJSActions(ctrl1, props);

    return (
        <Select
            value={ctrl1.value}
            useSelectProps={ctrl1.useSelectProps}
            options={ctrl1.options}
            onClear={ctrl1.handleClear}
            clearable={props.clearable}
            empty={ctrl1.isEmpty}
            onFocus={ctrl1.handleFocus}
            onMenuScroll={handleMenuScroll}
            showCheckboxes={ctrl1.multiselect}
            className={props.className}
            style={props.styles}
        />
    );
});

// eslint-disable-next-line prefer-arrow-callback
const ComboboxWidget = observer(function ComboboxWidget(props: RefFilterContainerProps): React.ReactElement {
    const ctrl2 = useSetupUpdate(() => new RefComboboxController(props), props);
    const handleMenuScroll = useOnScrollBottom(ctrl2.handleMenuScrollEnd, { triggerZoneHeight: 100 });

    usePickerJSActions(ctrl2, props);

    return (
        <Combobox
            options={ctrl2.options}
            inputPlaceholder={ctrl2.inputPlaceholder}
            useComboboxProps={ctrl2.useComboboxProps}
            onClear={ctrl2.handleClear}
            onFocus={ctrl2.handleFocus}
            onBlur={ctrl2.handleBlur}
            onMenuScroll={handleMenuScroll}
            empty={ctrl2.isEmpty}
            className={props.className}
            style={props.styles}
        />
    );
});

// eslint-disable-next-line prefer-arrow-callback
const TagPickerWidget = observer(function TagPickerWidget(props: RefFilterContainerProps): React.ReactElement {
    const ctrl3 = useSetupUpdate(() => new RefTagPickerController(props), props);
    const handleMenuScroll = useOnScrollBottom(ctrl3.handleMenuScrollEnd, { triggerZoneHeight: 100 });

    usePickerJSActions(ctrl3, props);

    return (
        <TagPicker
            options={ctrl3.options}
            selected={ctrl3.selectedOptions}
            useMultipleSelectionProps={ctrl3.useMultipleSelectionProps}
            useComboboxProps={ctrl3.useComboboxProps}
            onClear={ctrl3.handleClear}
            onBlur={ctrl3.handleBlur}
            onFocus={ctrl3.handleFocus}
            onMenuScroll={handleMenuScroll}
            inputPlaceholder={ctrl3.inputPlaceholder}
            empty={ctrl3.isEmpty}
            showCheckboxes={props.selectionMethod === "checkbox"}
            selectedStyle={props.selectedItemsStyle}
            className={props.className}
            style={props.styles}
        />
    );
});

export const RefFilterContainer = Container;
