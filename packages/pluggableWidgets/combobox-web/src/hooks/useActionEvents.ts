import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { FocusEvent, useMemo } from "react";
import { ComboboxContainerProps } from "../../typings/ComboboxProps";
import { Selector } from "../helpers/types";

type UseActionEventsReturnValue = {
    onFocus: (e: FocusEvent) => void;
    onBlur: (e: FocusEvent) => void;
};

interface useActionEventsProps extends Pick<ComboboxContainerProps, "onEnterEvent" | "onLeaveEvent"> {
    selector: Selector;
}

export function useActionEvents(props: useActionEventsProps): UseActionEventsReturnValue {
    return useMemo(() => {
        return {
            onFocus: (e: FocusEvent): void => {
                const { relatedTarget, currentTarget } = e;
                if (!currentTarget?.contains(relatedTarget)) {
                    executeAction(props.onEnterEvent);

                    if (props.selector.onEnterEvent) {
                        props.selector.onEnterEvent();
                    }
                }
            },
            onBlur: (e: FocusEvent): void => {
                const { relatedTarget, currentTarget } = e;
                if (!currentTarget?.contains(relatedTarget)) {
                    executeAction(props.onLeaveEvent);

                    if (props.selector.onLeaveEvent) {
                        props.selector.onLeaveEvent();
                    }
                }
            }
        };
    }, [props.onEnterEvent, props.onLeaveEvent]);
}
