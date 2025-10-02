import classNames from "classnames";
import { ChangeEvent, createElement, MouseEvent, ReactElement } from "react";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { getValidationErrorId } from "../../helpers/utils";
import { CaptionContent } from "../CaptionContent";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { Placeholder } from "../Placeholder";
import { If } from "@mendix/widget-plugin-component-kit/If";

export function RadioSelection({
    selector,
    tabIndex = 0,
    inputId,
    ariaRequired,
    readOnlyStyle,
    groupName,
    noOptionsText
}: SelectionBaseProps<SingleSelector>): ReactElement {
    const asSingleCheckbox = selector.controlType === "checkbox";

    const allOptions = selector.options.getAll();
    const checkboxOption = asSingleCheckbox ? (allOptions.includes("true") ? "true" : allOptions[0]) : undefined;
    const options: string[] = asSingleCheckbox ? (checkboxOption ? [checkboxOption] : []) : allOptions;

    const currentId = selector.currentId;
    const isReadOnly = selector.readOnly;
    const name = groupName?.value ?? inputId;

    const validation = selector.validation;
    const errorId = getValidationErrorId(inputId);

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        if (isReadOnly) {
            return;
        }

        if (asSingleCheckbox) {
            selector.setValue(e.target.checked ? "true" : "false");
        } else {
            selector.setValue(e.target.value);
        }
    };

    return (
        <div
            className={classNames("widget-checkbox-radio-selection-list", {
                "widget-checkbox-radio-selection-readonly": isReadOnly,
                [`widget-checkbox-radio-selection-readonly-${readOnlyStyle}`]: isReadOnly
            })}
            role={asSingleCheckbox ? "group" : "radiogroup"}
            aria-labelledby={`${inputId}-label`}
            aria-required={ariaRequired?.value}
        >
            {options.map((optionId, index) => {
                const isSelected = currentId === optionId;
                const controlId = `${inputId}-${selector.controlType}-${index}`;
                if (isReadOnly && !isSelected && readOnlyStyle === "text") {
                    return null;
                }

                return (
                    <div
                        key={optionId}
                        className={classNames("widget-checkbox-radio-selection-item", `${selector.controlType}-item`, {
                            "widget-checkbox-radio-selection-item-selected": isSelected
                        })}
                    >
                        <If condition={!isReadOnly || readOnlyStyle !== "text"}>
                            <input
                                type={selector.controlType}
                                id={controlId}
                                name={name}
                                value={optionId}
                                checked={isSelected}
                                disabled={isReadOnly}
                                tabIndex={tabIndex}
                                onChange={handleChange}
                            />
                        </If>
                        <CaptionContent
                            onClick={(e: MouseEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                if (!isReadOnly) {
                                    selector.setValue(asSingleCheckbox ? (isSelected ? "false" : "true") : optionId);
                                }
                            }}
                            htmlFor={controlId}
                        >
                            {selector.caption.render(optionId)}
                        </CaptionContent>
                    </div>
                );
            })}
            {options.length === 0 && <Placeholder noOptionsText={noOptionsText} />}
            {validation && <ValidationAlert referenceId={errorId}>{validation}</ValidationAlert>}
        </div>
    );
}
