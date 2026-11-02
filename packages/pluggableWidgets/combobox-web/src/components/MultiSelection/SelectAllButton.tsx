import classNames from "classnames";
import { Fragment, ReactElement } from "react";
import { ThreeStateCheckBox, ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { Caption } from "../Caption";
import { classes } from "../classes";
import { legacy } from "../legacyModifiers";

interface SelectAllButtonProps {
    id?: string;
    disabled?: boolean;
    ariaLabel?: string;
    value: ThreeStateCheckBoxEnum;
    onChange?: () => void;
}

export function SelectAllButton({ id, disabled, ariaLabel, value, onChange }: SelectAllButtonProps): ReactElement {
    return (
        <Fragment>
            <span
                className={classNames(classes.selectAll, classes.icon, { [legacy.selectAllDisabled]: disabled })}
                data-disabled={disabled || undefined}
            >
                <ThreeStateCheckBox value={disabled ? "none" : value} id={id} onChange={onChange} disabled={disabled} />
            </span>
            {ariaLabel ? (
                // empty onclick function is being set to allow label clicking
                // the actual event occurs on checkbox input inside ThreeStateCheckBox
                // if being set to onChange, the event will be triggered twice
                // if undefined, label click will not be triggered.
                <Caption onClick={() => {}} htmlFor={id}>
                    {ariaLabel}
                </Caption>
            ) : undefined}
        </Fragment>
    );
}
