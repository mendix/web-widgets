import { executeAction } from "@mendix/pluggable-widgets-commons";
import { useMemo, FocusEvent } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

export function useActionEvents(props: ComboboxContainerProps) {
    return useMemo(() => {
        return {
            onFocus: (e: FocusEvent): void => {
                const { relatedTarget, currentTarget } = e;
                if (!currentTarget?.contains(relatedTarget)) {
                    executeAction(props.onEnterEvent);
                }
            },
            onBlur: (e: FocusEvent): void => {
                const { relatedTarget, currentTarget } = e;
                if (!currentTarget?.contains(relatedTarget)) {
                    executeAction(props.onLeaveEvent);
                }
            }
        };
    }, [props.onEnterEvent, props.onLeaveEvent]);
}
