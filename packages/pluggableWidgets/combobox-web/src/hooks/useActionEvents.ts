import { executeAction } from "@mendix/pluggable-widgets-commons";
import { FocusEvent, useMemo } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";

type UseActionEventsReturnValue = {
    onFocus: (e: FocusEvent) => void;
    onBlur: (e: FocusEvent) => void;
};

export function useActionEvents(props: ComboboxContainerProps): UseActionEventsReturnValue {
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
