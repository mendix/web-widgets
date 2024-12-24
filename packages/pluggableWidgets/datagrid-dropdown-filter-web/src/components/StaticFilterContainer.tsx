import { StaticFilterController } from "@mendix/widget-plugin-filtering/controllers/StaticFilterController";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SelectPanel } from "@mendix/widget-plugin-filtering/controls";
import { StaticSelectController } from "@mendix/widget-plugin-filtering/adapters/StaticSelectController";
import { Select } from "@mendix/widget-plugin-filtering/next/Dropdown";
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

    const USE_SELECT = true;

    if (USE_SELECT) {
        return <Select triggerValue={ctrl2.triggerValue()} getHookProps={ctrl2.getSelectProps} items={ctrl2.options} />;
    }

    return (
        <SelectPanel
            searchValue={controller.searchValue}
            options={controller.options}
            value={controller.inputValue}
            onSelect={controller.onSelect}
            onSearch={controller.onSearch}
        />
    );
}

export const StaticFilterContainer = withCustomOptionsGuard(observer(Container));
