import { RefFilterController } from "@mendix/widget-plugin-filtering/controllers/RefFilterController";
import { useOnResetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { Select } from "@mendix/widget-plugin-filtering/controls";
import { OptionListFilterInterface } from "@mendix/widget-plugin-filtering/typings/OptionListFilterInterface";
import { useOnScrollBottom } from "@mendix/widget-plugin-hooks/useOnScrollBottom";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ActionValue } from "mendix";
import { observer } from "mobx-react-lite";
import { createElement, CSSProperties, useEffect, useRef, useState } from "react";
export interface RefFilterContainerProps {
    name: string;
    parentChannelName?: string;
    filterStore: OptionListFilterInterface;
    multiselect: boolean;
    emptyCaption?: string;
    ariaLabel?: string;
    className?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    onChange?: ActionValue;
}

function Container(props: RefFilterContainerProps): React.ReactElement {
    const id = (useRef<string>().current ??= `Dropdown${generateUUID()}`);
    const [controller] = useState(
        () =>
            new RefFilterController({
                store: props.filterStore,
                multiselect: props.multiselect,
                emptyCaption: props.emptyCaption,
                onChange: props.onChange
            })
    );

    useEffect(() => controller.setup(), [controller]);
    useEffect(() => controller.updateProps({ onChange: props.onChange }), [controller, props.onChange]);
    useOnResetValueEvent({
        widgetName: props.name,
        parentChannelName: props.parentChannelName,
        listener: controller.handleResetValue
    });
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
            id={id}
            ariaLabel={props.ariaLabel}
            className={props.className}
            tabIndex={props.tabIndex}
            styles={props.styles}
        />
    );
}

export const RefFilterContainer = observer(Container);
