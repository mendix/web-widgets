import classnames from "classnames";
import { EditableValue, ListValue } from "mendix";
// import deepEqual from "deep-equal";
import { ReactElement, createElement, useRef } from "react";
import { AppEventsContainerProps } from "../typings/AppEventsProps";
import { useActionTimer } from "./hooks/timer";
import "./ui/AppEvents.scss";
import deepEqual from "deep-equal";

export default function Appevents(props: AppEventsContainerProps): ReactElement {
    const {
        class: className,
        onComponentLoad,
        componentLoadDelay,
        componentLoadRepeat,
        componentLoadRepeatInterval,
        optionsSourceAttributeDataSource,
        optionsSourceAssociationDataSource,
        onEventChange,
        onEventChangeDelay,
        optionsSourceType
    } = props;
    const prevOnChangeAttributeValue = useRef<EditableValue<any> | undefined>();
    const prevOnChangeAssociationValue = useRef<
        Pick<ListValue, "items" | "limit" | "status" | "totalCount"> | undefined
    >();
    useActionTimer({
        canExecute: onComponentLoad?.canExecute,
        execute: onComponentLoad?.execute,
        delay: componentLoadDelay,
        interval: componentLoadRepeatInterval,
        repeat: componentLoadRepeat,
        attribute: []
    });
    console.log("props changes", props, prevOnChangeAssociationValue.current);
    useActionTimer({
        canExecute: onEventChange?.canExecute,
        execute: () => {
            if (optionsSourceType === "attribute") {
                if (optionsSourceAttributeDataSource?.status === "loading") {
                    return;
                }
                if (prevOnChangeAttributeValue?.current?.value === undefined) {
                    // ignore initial load
                    prevOnChangeAttributeValue.current = optionsSourceAttributeDataSource;
                } else {
                    if (optionsSourceAttributeDataSource?.value !== prevOnChangeAttributeValue.current?.value) {
                        prevOnChangeAttributeValue.current = optionsSourceAttributeDataSource;
                        onEventChange?.execute();
                    }
                }
            } else if (optionsSourceType === "association") {
                if (optionsSourceAssociationDataSource?.status === "loading") {
                    return;
                }
                if (prevOnChangeAssociationValue?.current === undefined) {
                    // ignore initial load
                    prevOnChangeAssociationValue.current = optionsSourceAssociationDataSource;
                } else {
                    if (!deepEqual(optionsSourceAssociationDataSource, prevOnChangeAssociationValue.current)) {
                        prevOnChangeAssociationValue.current = optionsSourceAssociationDataSource;
                        onEventChange?.execute();
                    }
                }
            }
        },
        delay: onEventChangeDelay,
        interval: 0,
        repeat: false,
        attribute: [optionsSourceAttributeDataSource, optionsSourceAssociationDataSource]
    });
    return <div className={classnames("widget-appevents", className)}></div>;
}
