import { ThreeStateCheckBox, ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
import classNames from "classnames";
import { UseComboboxPropGetters } from "downshift/typings";
import { Fragment, ReactElement, createElement } from "react";
import { CaptionContent } from "../../helpers/Association/AssociationSimpleCaptionsProvider";

interface SelectAllButtonProps extends Partial<UseComboboxPropGetters<string>> {
    id?: string;
    ariaLabel?: string;
    value: ThreeStateCheckBoxEnum;
    onChange?: () => void;
}

export function SelectAllButton({ id, ariaLabel, value, onChange }: SelectAllButtonProps): ReactElement {
    return (
        <Fragment>
            <span
                className={classNames(
                    "widget-combobox-menu-header-select-all-button",
                    "widget-combobox-icon-container"
                )}
            >
                <ThreeStateCheckBox value={value} id={id} onChange={onChange} />
            </span>
            {ariaLabel ? (
                <CaptionContent onClick={onChange} htmlFor={id}>
                    {ariaLabel}
                </CaptionContent>
            ) : undefined}
        </Fragment>
    );
}
