import { RefSelectController } from "../controllers/RefSelectController";
import { RefComboboxController } from "../controllers/RefComboboxController";
import { RefTagPickerController } from "../controllers/RefTagPickerController";
import { Select } from "../controls/select/Select";
import { Combobox } from "../controls/combobox/Combobox";
import { TagPicker } from "../controls/tag-picker/TagPicker";
import { usePickerJSActions } from "../helpers/usePickerJSActions";
import { RefFilterStore } from "../stores/RefFilterStore";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useEffect } from "react";

import { useFrontendType } from "../helpers/useFrontendType";
import { useOnScrollBottom } from "@mendix/widget-plugin-hooks/useOnScrollBottom";
import { SelectedItemsStyleEnum, SelectionMethodEnum } from "../typings/widget";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";

export interface RefFilterContainerProps {
    ariaLabel: string;
    className?: string;
    defaultValue?: string;
    emptyOptionCaption: string;
    emptySelectionCaption: string;
    placeholder: string;
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

const SelectWidget = observer(function SelectWidget(props: RefFilterContainerProps): React.ReactElement {
    const gate = useGate(props);
    const ctrl1 = useSetup(() => new RefSelectController({ gate }));
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
            ariaLabel={props.ariaLabel}
        />
    );
});

const ComboboxWidget = observer(function ComboboxWidget(props: RefFilterContainerProps): React.ReactElement {
    const gate = useGate(props);
    const ctrl2 = useSetup(() => new RefComboboxController({ gate }));
    const handleMenuScroll = useOnScrollBottom(ctrl2.handleMenuScrollEnd, { triggerZoneHeight: 100 });

    usePickerJSActions(ctrl2, props);

    return (
        <Combobox
            options={ctrl2.options}
            inputPlaceholder={ctrl2.inputPlaceholder}
            emptyCaption={ctrl2.emptyCaption}
            ariaLabel={props.ariaLabel}
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

const TagPickerWidget = observer(function TagPickerWidget(props: RefFilterContainerProps): React.ReactElement {
    const gate = useGate(props);
    const ctrl3 = useSetup(() => new RefTagPickerController({ gate }));
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
            emptyCaption={ctrl3.emptyCaption}
            ariaLabel={props.ariaLabel}
            empty={ctrl3.isEmpty}
            showCheckboxes={props.selectionMethod === "checkbox"}
            selectedStyle={props.selectedItemsStyle}
            className={props.className}
            style={props.styles}
        />
    );
});

export const RefFilterContainer = Container;

function useGate(props: RefFilterContainerProps): DerivedPropsGate<RefFilterContainerProps> {
    const gp = useConst(() => new GateProvider(props));
    useEffect(() => gp.setProps(props));
    return gp.gate;
}
