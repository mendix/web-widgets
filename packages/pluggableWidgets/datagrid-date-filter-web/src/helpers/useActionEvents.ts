import { useOnResetValueEvent, useOnSetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering";
import { useState } from "react";
import { ValueController } from "./ValueController";

type HookParams = [Parameters<typeof useOnResetValueEvent>[0], Parameters<typeof useOnSetValueEvent>[0]];

interface Props {
    name: string;
    store: Date_InputFilterInterface;
    parentChannelName?: string;
}

export function useActionEvents(props: Props): void {
    const [controller] = useState(() => new ValueController(props.store));
    const [[resetParams, setValueParams]] = useState<HookParams>(() => {
        return [
            {
                widgetName: props.name,
                parentChannelName: props.parentChannelName,
                listener: controller.handleReset
            },
            {
                widgetName: props.name,
                listener: controller.handleSetValue
            }
        ];
    });

    useOnSetValueEvent(setValueParams);
    useOnResetValueEvent(resetParams);
}
