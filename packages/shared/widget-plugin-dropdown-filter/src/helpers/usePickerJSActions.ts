import { IJSActionsControlled } from "@mendix/filter-commons/typings/IJSActionsControlled";
import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";

export function usePickerJSActions(
    controller: IJSActionsControlled,
    props: { name: string; parentChannelName?: string }
): void {
    useOnResetValueEvent({
        widgetName: props.name,
        parentChannelName: props.parentChannelName,
        listener: controller.handleResetValue
    });

    useOnSetValueEvent({
        widgetName: props.name,
        listener: controller.handleSetValue
    });
}
