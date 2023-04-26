import { executeAction } from "@mendix/pluggable-widgets-commons";
import { useMemo } from "react";
import { DropdownContainerProps } from "typings/DropdownProps";

export function useActionEvents(props: DropdownContainerProps) {
    return useMemo(() => {
        return {
            onClick: (): void => executeAction(props.onClickEvent),
            onMouseEnter: (): void => executeAction(props.onEnterEvent),
            onMouseLeave: (): void => executeAction(props.onLeaveEvent)
        };
    }, [props.onClickEvent, props.onEnterEvent, props.onLeaveEvent]);
}
