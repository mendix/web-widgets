import classnames from "classnames";
import { ReactElement } from "react";
import { EventsContainerProps } from "../typings/EventsProps";
import { useOnLoadTimer } from "./hooks/useOnLoadTimer";
import { useAttributeMonitor } from "./hooks/useAttributeMonitor";
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

    useOnLoadTimer({
        canExecute: onComponentLoad ? onComponentLoad.canExecute && !onComponentLoad.isExecuting : false,
        execute: onComponentLoad?.execute,
        delay: delayValue,
        interval: intervalValue,
        repeat: componentLoadRepeat,
        attribute: undefined
    });

    useAttributeMonitor({
        canExecute: onEventChange ? onEventChange.canExecute && !onEventChange.isExecuting : false,
        execute: onEventChange?.execute,
        delay: onEventChangeDelayValue,
        attribute: onEventChangeAttribute
    });

    return <div className={classnames("widget-events", className)}></div>;
}
