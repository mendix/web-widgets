import classNames from "classnames";
import { ChangeEvent, ReactElement, createElement, MouseEvent } from "react";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { CaptionContent } from "../CaptionContent";

export function RadioSelection({
    selector,
    tabIndex = 0,
    inputId,
    ariaRequired,
    readOnlyStyle,
    groupName
}: SelectionBaseProps<SingleSelector>): ReactElement {
    const options = selector.options.getAll();
    const currentId = selector.currentId;
    const isReadOnly = selector.readOnly;
    const name = groupName?.value ?? inputId;

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const selectedItem = e.target.value;
        if (!isReadOnly) {
            selector.setValue(selectedItem);
        }
    };

    return (
        <div
            className={classNames("widget-checkbox-radio-selection-radio", {
                "widget-checkbox-radio-selection-readonly": isReadOnly,
                [`widget-checkbox-radio-selection-readonly-${readOnlyStyle}`]: isReadOnly
            })}
        >
            <div
                className="widget-checkbox-radio-selection-radio-list"
                role="radiogroup"
                aria-labelledby={`${inputId}-label`}
                aria-required={ariaRequired?.value}
            >
                {options.map((optionId, index) => {
                    const isSelected = currentId === optionId;
                    const radioId = `${inputId}-radio-${index}`;
                    return (
                        <div
                            key={optionId}
                            className={classNames("widget-checkbox-radio-selection-radio-item", {
                                "widget-checkbox-radio-selection-radio-item-selected": isSelected
                            })}
                        >
                            <input
                                type={selector.controlType}
                                id={radioId}
                                name={name}
                                value={optionId}
                                checked={isSelected}
                                disabled={isReadOnly}
                                tabIndex={tabIndex}
                                onChange={handleChange}
                            />
                            <CaptionContent
                                onClick={(e: MouseEvent<HTMLDivElement>) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    if (!isReadOnly) {
                                        selector.setValue(optionId);
                                    }
                                }}
                                htmlFor={radioId}
                            >
                                {selector.caption.render(optionId)}
                            </CaptionContent>
                        </div>
                    );
                })}
                {options.length === 0 && (
                    <div className="widget-checkbox-radio-selection-no-options">No options available</div>
                )}
            </div>
        </div>
    );
}
