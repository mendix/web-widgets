import { StaticFilterController } from "@mendix/widget-plugin-filtering/controllers/StaticFilterController";
import { Select } from "@mendix/widget-plugin-filtering/controls";
import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ActionValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useEffect, useRef, useState } from "react";
import { FilterOptionsType } from "../../typings/DatagridDropdownFilterProps";
import { withCustomOptionsGuard } from "../hocs/withCustomOptionsGuard";

export interface StaticFilterContainerProps {
    filterStore: OptionListFilterInterface<string>;
    filterOptions: FilterOptionsType[];
    multiselect: boolean;
    defaultValue?: string;
    ariaLabel?: string;
    className?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    onChange?: ActionValue;
}

function Container(props: StaticFilterContainerProps): React.ReactElement {
    const id = (useRef<string>().current ??= `Dropdown${generateUUID()}`);
    const [controller] = useState(() => new StaticFilterController(props));

    useEffect(() => controller.setup(), [controller]);

    return (
        <Select
            options={controller.options}
            empty={controller.empty}
            onSelect={controller.onSelect}
            multiSelect={controller.multiselect}
            inputValue={controller.inputValue}
            id={id}
            ariaLabel={props.ariaLabel}
            className={props.className}
            tabIndex={props.tabIndex}
            styles={props.styles}
        />
    );
}

export const StaticFilterContainer = withCustomOptionsGuard(observer(Container));
