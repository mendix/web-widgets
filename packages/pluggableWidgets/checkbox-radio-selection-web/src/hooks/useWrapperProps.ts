import { useMemo } from "react";
import { getInputLabel } from "../helpers/utils";
import classNames from "classnames";
import { ReadOnlyStyleEnum } from "../../typings/CheckboxRadioSelectionProps";
import { DynamicValue } from "mendix";

interface WrapperProps {
    inputId: string;
    isReadOnly: boolean;
    isCheckbox: boolean;
    readOnlyStyle: ReadOnlyStyleEnum;
    ariaRequired: DynamicValue<boolean>;
    ariaLabel: DynamicValue<string> | undefined;
}

export function useWrapperProps(props: WrapperProps): any {
    const { inputId, isReadOnly, isCheckbox, readOnlyStyle, ariaRequired, ariaLabel } = props;

    const inputLabel = getInputLabel(inputId);
    const hasLabel = useMemo(() => Boolean(inputLabel), [inputLabel]);
    const hasAriaLabel = useMemo(() => Boolean(ariaLabel && ariaLabel.value), [ariaLabel]);

    return {
        className: classNames("widget-checkbox-radio-selection-list", {
            "widget-checkbox-radio-selection-readonly": isReadOnly,
            [`widget-checkbox-radio-selection-readonly-${readOnlyStyle}`]: isReadOnly
        }),
        id: inputId,
        role: isCheckbox ? "group" : "radiogroup",
        "aria-labelledby": hasLabel ? `${inputId}-label` : undefined,
        "aria-required": ariaRequired ? ariaRequired.value : undefined,
        "aria-label": hasAriaLabel ? ariaLabel?.value : undefined
    };
}
