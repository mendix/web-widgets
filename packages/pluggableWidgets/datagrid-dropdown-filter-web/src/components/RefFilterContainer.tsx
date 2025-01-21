import { RefSelectController } from "@mendix/widget-plugin-filtering/controllers/picker/RefSelectController";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";
import { usePickerJSActions } from "@mendix/widget-plugin-filtering/helpers/usePickerJSActions";
import { useSetup } from "@mendix/widget-plugin-filtering/helpers/useSetup";
import { RefFilterStore } from "@mendix/widget-plugin-filtering/stores/picker/RefFilterStore";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties } from "react";

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
    const isSelect = true;
    // const isCombobox = false;

    if (isSelect) {
        return <SelectWidget {...props} />;
    }

    return <div>Unknown</div>;
    // if (isCombobox) {
    //     return <ComboboxWidget {...props} />;
    // }

    // return <TagPickerWidget {...props} />;
    // return;
}

// eslint-disable-next-line prefer-arrow-callback
const SelectWidget = observer(function SelectWidget(props: RefFilterContainerProps): React.ReactElement {
    const ctrl1 = useSetup(() => new RefSelectController(props));

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

export const RefFilterContainer = Container;
