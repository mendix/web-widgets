import { ThreeStateCheckBox, ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { Fragment, ReactElement, createElement } from "react";
import { CaptionContent } from "../../helpers/utils";

interface SelectAllButtonProps extends Partial<UseComboboxPropGetters<string>> {
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
                className={classNames(
                    "widget-combobox-menu-header-select-all-button",
                    "widget-combobox-icon-container",
                    {
                        "widget-combobox-menu-header-select-all-button-disabled": disabled
                    }
                )}
            >
                <ThreeStateCheckBox value={disabled ? "none" : value} id={id} onChange={onChange} disabled={disabled} />
            </span>
            {ariaLabel ? (
                // empty onclick function is being set to allow label clicking
                // the actual event occurs on checkbox input inside ThreeStateCheckBox
                // if being set to onChange, the event will be triggered twice
                // if undefined, label click will not be triggered.
                <CaptionContent onClick={() => {}} htmlFor={id}>
                    {ariaLabel}
                </CaptionContent>
            ) : undefined}
        </Fragment>
    );
}
