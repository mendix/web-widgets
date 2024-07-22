import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";
import { StaticFilterController } from "@mendix/widget-plugin-filtering/controllers/StaticFilterController";
import { Select } from "@mendix/widget-plugin-filtering/controls";
import { observer } from "mobx-react-lite";
import { createElement, useState } from "react";

export interface StaticFilterContainerProps {
    filterStore: OptionListFilterInterface<string>;
    multiselect: boolean;
}

function Container(props: StaticFilterContainerProps): React.ReactElement {
    const [controller] = useState(
        () => new StaticFilterController({ store: props.filterStore, multiselect: props.multiselect })
    );
    return (
        <Select
            options={controller.options}
            empty={controller.empty}
            onSelect={controller.onSelect}
            multiSelect={controller.multiselect}
            inputValue={controller.inputValue}
        />
    );
}

export const StaticFilterContainer = observer(Container);
