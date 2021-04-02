import { createElement, FunctionComponent, KeyboardEvent, useCallback } from "react";
import { executeAction, isAvailable, Alert } from "@mendix/piw-utils-internal";
import { ValueStatus } from "mendix";
import classNames from "classnames";

import { SwitchContainerProps } from "../typings/SwitchProps";
import "./ui/Switch.scss";

export const Switch: FunctionComponent<SwitchContainerProps> = props => {
    const isChecked = isAvailable(props.booleanAttribute);
    const editable = !props.booleanAttribute.readOnly;
    const onClick = useCallback(() => {
        if (props.booleanAttribute.status === ValueStatus.Available) {
            props.booleanAttribute.setValue(!props.booleanAttribute.value);
        }
        executeAction(props.action);
    }, [props.action, props.booleanAttribute]);
    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (editable && e.key === " ") {
                e.preventDefault();
                executeAction(props.action);
            }
        },
        [props.action, editable]
    );

    return (
        <div className={classNames("widget-switch", props.class, props.deviceStyle)} style={props.style}>
            <input
                checked={isChecked}
                className={classNames("widget-switch-checkbox", { enabled: editable })}
                readOnly
                type="checkbox"
            />
            <div
                className={classNames("widget-switch-btn-wrapper", "widget-switch-btn-wrapper-default", {
                    checked: isChecked,
                    disabled: !editable,
                    "un-checked": !isChecked
                })}
                onClick={editable ? onClick : undefined}
                onKeyDown={onKeyDown}
                tabIndex={props.tabIndex ?? 0}
                role="checkbox"
                aria-checked={isChecked}
                aria-labelledby={props.id}
            >
                <small
                    className={classNames("widget-switch-btn", {
                        left: !isChecked,
                        right: isChecked
                    })}
                />
            </div>
            <Alert bootstrapStyle={"danger"}>{props.booleanAttribute.validation}</Alert>
        </div>
    );
};

Switch.displayName = "Switch";
