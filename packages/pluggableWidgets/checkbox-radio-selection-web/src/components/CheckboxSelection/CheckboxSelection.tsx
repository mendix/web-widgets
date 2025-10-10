import classNames from "classnames";
import { MouseEvent, ReactElement } from "react";
import { MultiSelector, SelectionBaseProps } from "../../helpers/types";
import { getValidationErrorId } from "../../helpers/utils";
import { CaptionContent } from "../CaptionContent";
import { ValidationAlert } from "@mendix/widget-plugin-component-kit/Alert";
import { Placeholder } from "../Placeholder";

export function CheckboxSelection({
    selector,
    tabIndex = 0,
    inputId,
    ariaRequired,
    readOnlyStyle,
    groupName,
    noOptionsText
}: SelectionBaseProps<MultiSelector>): ReactElement {
    const options = selector.getOptions();
    const currentIds = selector.currentId || [];
    const isReadOnly = selector.readOnly;
    const name = groupName?.value ?? inputId;

    const validation = selector.validation;
    const errorId = getValidationErrorId(inputId);

    const handleChange = (optionId: string, checked: boolean): void => {
        if (!isReadOnly) {
            const newSelection = checked ? [...currentIds, optionId] : currentIds.filter(id => id !== optionId);
            selector.setValue(newSelection);
        }
    };

    const isSingleCheckbox = options.length === 1;

    return (
        <div
            className={classNames("widget-checkbox-radio-selection-list", {
                "widget-checkbox-radio-selection-readonly": isReadOnly,
                [`widget-checkbox-radio-selection-readonly-${readOnlyStyle}`]: isReadOnly
            })}
            role="group"
            aria-labelledby={`${inputId}-label`}
            aria-required={ariaRequired?.value}
            aria-describedby={!isSingleCheckbox && selector.validation ? errorId : undefined}
            aria-invalid={!isSingleCheckbox && selector.validation ? true : undefined}
        >
            {options.map((optionId, index) => {
                const isSelected = currentIds.includes(optionId);
                const checkboxId = `${inputId}-checkbox-${index}`;

                return (
                    <div
                        key={optionId}
                        className={classNames("widget-checkbox-radio-selection-item", "checkbox-item", {
                            "widget-checkbox-radio-selection-item-selected": isSelected
                        })}
                    >
                        <input
                            type="checkbox"
                            id={checkboxId}
                            name={name}
                            value={optionId}
                            checked={isSelected}
                            disabled={isReadOnly}
                            tabIndex={tabIndex}
                            onChange={e => handleChange(optionId, e.target.checked)}
                            aria-describedby={isSingleCheckbox && selector.validation ? errorId : undefined}
                            aria-invalid={isSingleCheckbox && selector.validation ? true : undefined}
                        />
                        <CaptionContent
                            onClick={(e: MouseEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                handleChange(optionId, !isSelected);
                            }}
                            htmlFor={checkboxId}
                        >
                            {selector.caption.render(optionId)}
                        </CaptionContent>
                    </div>
                );
            })}
            {options.length === 0 && <Placeholder noOptionsText={noOptionsText} />}
            {validation && <ValidationAlert id={errorId}>{validation}</ValidationAlert>}
        </div>
    );
}
