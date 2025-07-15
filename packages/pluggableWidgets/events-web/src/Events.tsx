import classnames from "classnames";
import { EditableValue } from "mendix";
import { ReactElement, createElement, useRef } from "react";
import { EventsContainerProps } from "../typings/EventsProps";
import { useActionTimer } from "./hooks/timer";
import { useDelayAndInterval } from "./hooks/delayAndInterval";
import "./ui/Events.scss";

export default function Events(props: EventsContainerProps): ReactElement {
    const {
        class: className,
        onComponentLoad,
        componentLoadDelayExpression,
        componentLoadDelay,
        componentLoadRepeat,
        onEventChangeAttribute,
        onEventChange,
        componentLoadRepeatInterval,
        componentLoadRepeatIntervalParameterType,
        componentLoadRepeatIntervalExpression,
        componentLoadDelayParameterType,
        onEventChangeDelay,
        onEventChangeDelayParameterType,
        onEventChangeDelayExpression
    } = props;
    const prevOnChangeAttributeValue = useRef<EditableValue<any> | undefined>();

    const [delayValue, intervalValue] = useDelayAndInterval({
        componentLoadDelayParameterType,
        componentLoadRepeatIntervalParameterType,
        onEventChangeDelayParameterType,
        componentLoadDelay,
        componentLoadRepeatInterval,
        onEventChangeDelay,
        componentLoadRepeatIntervalExpression,
        componentLoadDelayExpression,
        onEventChangeDelayExpression
    });

    useActionTimer({
        canExecute: onComponentLoad?.canExecute,
        execute: onComponentLoad?.execute,
        delay: delayValue,
        interval: intervalValue,
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
                prevOnChangeAttributeValue.current = onEventChangeAttribute;
            } else {
                if (onEventChangeAttribute?.value !== prevOnChangeAttributeValue.current?.value) {
                    prevOnChangeAttributeValue.current = onEventChangeAttribute;
                    onEventChange?.execute();
                }
            }
        },
        delay: delayValue,
        interval: 0,
        repeat: false,
        attribute: onEventChangeAttribute
    });
    return <div className={classnames("widget-events", className)}></div>;
}
