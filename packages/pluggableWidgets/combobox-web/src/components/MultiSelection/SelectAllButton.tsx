import { UseComboboxPropGetters } from "downshift/typings";
import { ReactElement, Fragment, createElement } from "react";
import { ThreeStateCheckBox, ThreeStateCheckBoxEnum } from "@mendix/widget-plugin-component-kit/ThreeStateCheckBox";
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
            <span className="widget-combobox-icon-container">
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
