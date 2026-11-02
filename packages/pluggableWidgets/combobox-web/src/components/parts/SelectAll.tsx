import classNames from "classnames";
import { Fragment, ReactElement } from "react";
import { ThreeStateCheckBox } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import { ComboboxBehavior } from "../../hooks/useComboboxBehavior";
import { useComboboxClasses } from "../../hooks/useComboboxClasses";
import { Caption } from "../Caption";
import { legacy } from "../legacyModifiers";

export interface SelectAllProps {
    /** From the Behavior: id, label, three-state value, disabled flag and change handler. */
    selectAllProps: ReturnType<ComboboxBehavior["getSelectAllProps"]>;
}

/** The select-all control in the menu header of a multi-select. */
export function SelectAll({ selectAllProps }: SelectAllProps): ReactElement {
    const classes = useComboboxClasses();
    const { id, disabled, "aria-label": ariaLabel, checked, onChange } = selectAllProps;

    return (
        <Fragment>
            <span
                className={classNames(classes.selectAll, classes.icon, { [legacy.selectAllDisabled]: disabled })}
                data-disabled={disabled || undefined}
            >
                <ThreeStateCheckBox
                    value={disabled ? "none" : checked}
                    id={id}
                    onChange={onChange}
                    disabled={disabled}
                />
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
