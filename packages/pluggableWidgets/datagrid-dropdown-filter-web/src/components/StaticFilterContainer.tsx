import { StaticFilterController } from "@mendix/widget-plugin-filtering/controllers/StaticFilterController";
import { Select } from "@mendix/widget-plugin-filtering/controls";
import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { observer } from "mobx-react-lite";
import { createElement, useEffect, useRef, useState } from "react";

export interface StaticFilterContainerProps {
    filterStore: OptionListFilterInterface<string>;
    multiselect: boolean;
    defaultValue?: string;
}

function Container(props: StaticFilterContainerProps): React.ReactElement {
    const id = (useRef<string>().current ??= `Dropdown${generateUUID()}`);
    const [controller] = useState(
        () =>
            new StaticFilterController({
                store: props.filterStore,
                multiselect: props.multiselect,
                defaultValue: props.defaultValue
            })
    );

    useEffect(() => controller.setup(), [controller]);

    return (
        <Select
            options={controller.options}
            empty={controller.empty}
            onSelect={controller.onSelect}
            multiSelect={controller.multiselect}
            inputValue={controller.inputValue}
            id={id}
        />
    );
}

export const StaticFilterContainer = observer(Container);
