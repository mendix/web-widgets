import { StaticFilterController } from "@mendix/widget-plugin-filtering/controllers/StaticFilterController";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { StaticSelectController } from "@mendix/widget-plugin-filtering/controllers/StaticSelectController";
import { StaticComboboxController } from "@mendix/widget-plugin-filtering/controllers/StaticComboboxController";
import { Select } from "@mendix/widget-plugin-filtering/controls/select/Select";
import { Combobox } from "@mendix/widget-plugin-filtering/controls/combobox/Combobox";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useEffect, useState } from "react";
import { FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { withCustomOptionsGuard } from "../hocs/withCustomOptionsGuard";
import { StaticSelectFilterStore } from "@mendix/widget-plugin-filtering/stores/StaticSelectFilterStore";

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
    // const id = (useRef<string>().current ??= `Dropdown${generateUUID()}`);
    const [controller] = useState(() => new StaticFilterController(props));
    const [ctrl2] = useState(() => new StaticSelectController({ filterStore: props.filterStore }));
    const [ctrl3] = useState(() => new StaticComboboxController({ filterStore: props.filterStore }));

    useEffect(() => controller.setup(), [controller]);
    useEffect(() => controller.updateProps(props));

    useOnResetValueEvent({
        widgetName: props.name,
        parentChannelName: props.parentChannelName,
        listener: controller.handleResetValue
    });

    useOnSetValueEvent({
        widgetName: props.name,
        listener: controller.handleSetValue
    });

    const USE_SELECT = false;
    const USE_COMBOBOX = true;

    if (USE_SELECT) {
        return (
            <Select
                value={ctrl2.value}
                useSelectProps={ctrl2.useSelectProps}
                options={ctrl2.options}
                onClear={ctrl2.handleClear}
                clearable
            />
        );
    }

    if (USE_COMBOBOX) {
        return (
            <Combobox
                options={ctrl3.options}
                inputPlaceholder={ctrl3.inputPlaceholder}
                useComboboxProps={ctrl3.useComboboxProps}
                onClear={ctrl3.handleClear}
                onBlur={ctrl3.handleBlur}
            />
        );
    }

    return <div>Unknown</div>;
}

export const StaticFilterContainer = withCustomOptionsGuard(observer(Container));
