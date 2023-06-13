import { executeAction } from "@mendix/pluggable-widgets-commons";
import { useMemo } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useActionEvents(props: ComboboxContainerProps) {
    return useMemo(() => {
        return {
            onClick: (): void => executeAction(props.onClickEvent),
            onMouseEnter: (): void => executeAction(props.onEnterEvent),
            onMouseLeave: (): void => executeAction(props.onLeaveEvent)
        };
    }, [props.onClickEvent, props.onEnterEvent, props.onLeaveEvent]);
}
