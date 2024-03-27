import classnames from "classnames";
import { EditableValue } from "mendix";
import { ReactElement, createElement, useRef } from "react";
import { EventsContainerProps } from "../typings/EventsProps";
import { useActionTimer } from "./hooks/timer";
import "./ui/Events.scss";

export default function Events(props: EventsContainerProps): ReactElement {
    const {
        class: className,
        onComponentLoad,
        componentLoadDelay,
        componentLoadRepeat,
        componentLoadRepeatInterval,
        onEventChangeAttribute,
        onEventChange,
        onEventChangeDelay
        // optionsSourceType
    } = props;
    const prevOnChangeAttributeValue = useRef<EditableValue<any> | undefined>();
    useActionTimer({
        canExecute: onComponentLoad?.canExecute,
        execute: onComponentLoad?.execute,
        delay: componentLoadDelay,
        interval: componentLoadRepeatInterval,
        repeat: componentLoadRepeat,
        attribute: undefined
    });
    useActionTimer({
        canExecute: onEventChange?.canExecute,
        execute: () => {
            if (onEventChangeAttribute?.status === "loading") {
                return;
            }
            if (prevOnChangeAttributeValue?.current?.value === undefined) {
                // ignore initial load
                prevOnChangeAttributeValue.current = onEventChangeAttribute;
            } else {
                if (onEventChangeAttribute?.value !== prevOnChangeAttributeValue.current?.value) {
                    prevOnChangeAttributeValue.current = onEventChangeAttribute;
                    onEventChange?.execute();
                }
            }
        },
        delay: onEventChangeDelay,
        interval: 0,
        repeat: false,
        attribute: onEventChangeAttribute
    });
    return <div className={classnames("widget-events", className)}></div>;
}
