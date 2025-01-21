import { RefSelectController } from "@mendix/widget-plugin-filtering/controllers/picker/RefSelectController";
import { RefComboboxController } from "@mendix/widget-plugin-filtering/controllers/picker/RefComboboxController";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";
import { Combobox } from "@mendix/widget-plugin-filtering/controls/combobox/Combobox";
import { usePickerJSActions } from "@mendix/widget-plugin-filtering/helpers/usePickerJSActions";
import { RefFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/RefFilterStore";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties } from "react";
import { useSetupUpdate } from "@mendix/widget-plugin-filtering/helpers/useSetupUpdate";

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
}

// const handleContentScroll = useOnScrollBottom(controller.handleScrollEnd, { triggerZoneHeight: 100 });

function Container(props: RefFilterContainerProps): React.ReactElement {
    const isSelect = false;
    const isCombobox = true;

    if (isSelect) {
        return <SelectWidget {...props} />;
    }

    if (isCombobox) {
        return <ComboboxWidget {...props} />;
    }

    return <div>Unknown</div>;

    // return <TagPickerWidget {...props} />;
    // return;
}

// eslint-disable-next-line prefer-arrow-callback
const SelectWidget = observer(function SelectWidget(props: RefFilterContainerProps): React.ReactElement {
    const ctrl1 = useSetupUpdate(() => new RefSelectController(props), props);

    usePickerJSActions(ctrl1, props);

    return (
        <Select
            value={ctrl1.value}
            useSelectProps={ctrl1.useSelectProps}
            options={ctrl1.options}
            onClear={ctrl1.handleClear}
            clearable
            empty={ctrl1.isEmpty}
            onFocus={ctrl1.handleFocus}
            showCheckboxes={ctrl1.multiselect}
        />
    );
});

// eslint-disable-next-line prefer-arrow-callback
const ComboboxWidget = observer(function ComboboxWidget(props: RefFilterContainerProps): React.ReactElement {
    const ctrl2 = useSetupUpdate(() => new RefComboboxController(props), props);

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

export const RefFilterContainer = Container;
