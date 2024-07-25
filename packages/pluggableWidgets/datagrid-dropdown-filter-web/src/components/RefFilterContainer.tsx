import { createElement, useState, useEffect } from "react";
import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";
import { RefFilterController } from "@mendix/widget-plugin-filtering/controllers/RefFilterController";
import { Select } from "@mendix/widget-plugin-filtering/controls";
import { observer } from "mobx-react-lite";
import { useOnScrollBottom } from "@mendix/widget-plugin-hooks/useOnScrollBottom";

export interface RefFilterContainerProps {
    filterStore: OptionListFilterInterface<string>;
    multiselect: boolean;
    emptyCaption?: string;
}

function Container(props: RefFilterContainerProps): React.ReactElement {
    const [controller] = useState(
        () =>
            new RefFilterController({
                store: props.filterStore,
                multiselect: props.multiselect,
                emptyCaption: props.emptyCaption
            })
    );

    useEffect(() => controller.setup(), [controller]);
    const handleContentScroll = useOnScrollBottom(controller.handleScrollEnd, { triggerZoneHeight: 100 });

    return (
        <Select
            options={controller.options}
            empty={controller.empty}
            onSelect={controller.handleSelect}
            multiSelect={controller.multiselect}
            inputValue={controller.inputValue}
            onTriggerClick={controller.handleTriggerClick}
            onContentScroll={handleContentScroll}
        />
    );
}

export const RefFilterContainer = observer(Container);
