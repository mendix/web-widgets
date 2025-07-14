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
        componentLoadDelayExpression,
        componentLoadDelayInteger,
        componentLoadRepeat,
        onEventChangeAttribute,
        onEventChange,
        componentLoadRepeatInterval,
        componentLoadRepeatParameterType,
        componentLoadRepeatExpression,
        componentLoadDelayParameterType,
        onEventChangeDelay
    } = props;
    const prevOnChangeAttributeValue = useRef<EditableValue<any> | undefined>();
    let loadDelay;
    let repeatInterval;
    if (componentLoadDelayParameterType === "number") {
        loadDelay = componentLoadDelayInteger;
    } else {
        loadDelay =
            componentLoadDelayExpression.status === "available"
                ? componentLoadDelayExpression.value.toNumber()
                : undefined;
    }
    if (componentLoadRepeatParameterType === "number") {
        repeatInterval = componentLoadRepeatInterval;
    } else {
        repeatInterval =
            componentLoadRepeatExpression?.status === "available"
                ? componentLoadRepeatExpression.value.toNumber()
                : undefined;
    }
    useActionTimer({
        canExecute: onComponentLoad?.canExecute,
        execute: onComponentLoad?.execute,
        delay: loadDelay,
        interval: repeatInterval,
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
