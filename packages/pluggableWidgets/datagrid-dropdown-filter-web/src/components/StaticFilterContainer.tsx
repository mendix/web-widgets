import { StaticFilterController } from "@mendix/widget-plugin-filtering/controllers/StaticFilterController";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { SelectPanel } from "@mendix/widget-plugin-filtering/controls";
import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";
// import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ActionValue, EditableValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useEffect, useState } from "react";
import { FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { withCustomOptionsGuard } from "../hocs/withCustomOptionsGuard";

export interface StaticFilterContainerProps {
    parentChannelName: string | undefined;
    name: string;
    filterStore: OptionListFilterInterface;
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
