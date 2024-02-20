import classnames from "classnames";
import { EditableValue } from "mendix";
import { ReactElement, createElement, useRef } from "react";
import { AppEventsContainerProps } from "../typings/AppEventsProps";
import { useActionTimer } from "./hooks/timer";
import "./ui/AppEvents.scss";

export default function Appevents(props: AppEventsContainerProps): ReactElement {
    const {
        class: className,
        onComponentLoad,
        componentLoadDelay,
        componentLoadRepeat,
        componentLoadRepeatInterval,
        attributeEvent,
        onAttributeEventChange,
        onAttributeEventChangeDelay
    } = props;
    const prevAttributeValue = useRef<EditableValue<any> | undefined>(attributeEvent);
    useActionTimer({
        canExecute: onComponentLoad?.canExecute,
        execute: onComponentLoad?.execute,
        delay: componentLoadDelay,
        interval: componentLoadRepeatInterval,
        repeat: componentLoadRepeat
    });

    useActionTimer({
        canExecute: onAttributeEventChange?.canExecute,
        execute: () => {
            if (prevAttributeValue?.current?.value === undefined) {
                // ignore initial load
                prevAttributeValue.current = attributeEvent;
            } else {
                if (attributeEvent?.value !== prevAttributeValue.current?.value) {
                    prevAttributeValue.current = attributeEvent;
                    onAttributeEventChange?.execute();
                }
            }
        },
        delay: onAttributeEventChangeDelay,
        interval: 0,
        repeat: false,
        attribute: attributeEvent
    });
    return <div className={classnames("widget-appevents", className)}></div>;
}
