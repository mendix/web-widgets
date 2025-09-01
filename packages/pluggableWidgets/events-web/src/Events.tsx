import classnames from "classnames";
import { EditableValue } from "mendix";
import { createElement, ReactElement, useRef } from "react";
import { EventsContainerProps } from "../typings/EventsProps";
import { useActionTimer } from "./hooks/timer";
import { useParameterValue } from "./hooks/parameterValue";
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

    const delayValue = useParameterValue({
        parameterType: componentLoadDelayParameterType,
        parameterValue: componentLoadDelay,
        parameterExpression: componentLoadDelayExpression
    });
    const intervalValue = useParameterValue({
        parameterType: componentLoadRepeatIntervalParameterType,
        parameterValue: componentLoadRepeatInterval,
        parameterExpression: componentLoadRepeatIntervalExpression
    });
    const onEventChangeDelayValue = useParameterValue({
        parameterType: onEventChangeDelayParameterType,
        parameterValue: onEventChangeDelay,
        parameterExpression: onEventChangeDelayExpression
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
        delay: onEventChangeDelayValue,
        interval: 0,
        repeat: false,
        attribute: onEventChangeAttribute
    });
    return <div className={classnames("widget-events", className)}></div>;
}
