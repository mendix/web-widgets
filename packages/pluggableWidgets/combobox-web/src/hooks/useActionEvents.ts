import { executeAction } from "@mendix/pluggable-widgets-commons";
import { useMemo } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useActionEvents(props: ComboboxContainerProps) {
    return useMemo(() => {
        return {
            onFocus: (): void => executeAction(props.onEnterEvent),
            onBlur: (): void => executeAction(props.onLeaveEvent)
        };
    }, [props.onEnterEvent, props.onLeaveEvent]);
}
