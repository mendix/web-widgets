import { createElement, ReactElement, useEffect, useRef } from "react";
import classnames from "classnames";
import { AppEventsContainerProps } from "../typings/AppEventsProps";
import { ActionValue, EditableValue } from "mendix";
import "./ui/AppEvents.scss";

const executeAction = (action: ActionValue | undefined, delay: number): void => {
    if (action !== undefined) {
        setTimeout(action.execute, delay * 1000);
    }
};

export default function Appevents(props: AppEventsContainerProps): ReactElement {
    const {
        class: className,
        onComponentLoad,
        componentLoadDelay,
        attributeEvent,
        onAttributeEventChange,
        onAttributeEventChangeDelay
    } = props;
    const prevAttributeValue = useRef<EditableValue<any> | undefined>(attributeEvent);
    useEffect(() => {
        executeAction(onComponentLoad, componentLoadDelay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (attributeEvent !== prevAttributeValue.current) {
            prevAttributeValue.current = attributeEvent;
            executeAction(onAttributeEventChange, onAttributeEventChangeDelay);
        }
    }, [attributeEvent]);

    return <div className={classnames("widget-appevents", className)}></div>;
}
