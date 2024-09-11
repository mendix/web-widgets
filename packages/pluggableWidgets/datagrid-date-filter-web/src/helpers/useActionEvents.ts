import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { useState } from "react";
import { DatePickerController } from "./DatePickerController";

type HookParams = [Parameters<typeof useOnResetValueEvent>[0], Parameters<typeof useOnSetValueEvent>[0]];

interface Props {
    name: string;
    controller: DatePickerController;
    parentChannelName?: string;
}

export function useActionEvents({ name, controller, parentChannelName }: Props): void {
    const [[resetParams, setValueParams]] = useState<HookParams>(() => {
        return [
            {
                widgetName: name,
                parentChannelName,
                listener: controller.handleReset
            },
            {
                widgetName: name,
                listener: controller.handleSetValue
            }
        ];
    });

    useOnSetValueEvent(setValueParams);
    useOnResetValueEvent(resetParams);
}
