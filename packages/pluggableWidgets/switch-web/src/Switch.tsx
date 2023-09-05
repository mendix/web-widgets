import { createElement, KeyboardEvent, MouseEvent, useCallback } from "react";
import { executeAction } from "@mendix/widget-plugin-platform/framework/execute-action";
import { isAvailable } from "@mendix/widget-plugin-platform/framework/is-available";
import SwitchComponent from "./components/Switch";

import { SwitchContainerProps } from "../typings/SwitchProps";
import "./ui/switch-main.scss";

export function Switch(props: SwitchContainerProps) {
    const isChecked = isAvailable(props.booleanAttribute);
    const editable = !props.booleanAttribute.readOnly;

    const toggle = useCallback(() => {
        props.booleanAttribute.setValue(!props.booleanAttribute.value);
        executeAction(props.action);
    }, [props.action, props.booleanAttribute]);

    const onClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (editable) {
                toggle();
            }
        },
        [editable, toggle]
    );
    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (editable && event.key === " ") {
                toggle();
            }
        },
        [editable, toggle]
    );

    return (
        <SwitchComponent
            onClick={onClick}
            onKeyDown={onKeyDown}
            isChecked={isChecked}
            editable={editable}
            validation={props.booleanAttribute.validation}
            id={props.id}
            tabIndex={props.tabIndex}
        />
    );
}
