import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { SelectionBaseProps, MultiSelector } from "../../helpers/types";
import { CaptionContent } from "../CaptionContent";

export function CheckboxSelection({
    selector,
    tabIndex = 0,
    inputId,
    ariaRequired,
    readOnlyStyle
}: SelectionBaseProps<MultiSelector>): ReactElement {
    const options = selector.getOptions();
    const currentIds = selector.currentId || [];
    const isReadOnly = selector.readOnly;

    const handleChange = (optionId: string, checked: boolean): void => {
        if (!isReadOnly) {
            const newSelection = checked ? [...currentIds, optionId] : currentIds.filter(id => id !== optionId);
            selector.setValue(newSelection);
        }
    };

    return (
        <div
            className={classNames("widget-checkbox-radio-selection-checkbox", {
                "widget-checkbox-radio-selection-readonly": isReadOnly,
                [`widget-checkbox-radio-selection-readonly-${readOnlyStyle}`]: isReadOnly
            })}
        >
            <div
                className="widget-checkbox-radio-selection-checkbox-list"
                role="group"
                aria-labelledby={`${inputId}-label`}
                aria-required={ariaRequired?.value}
            >
                {options.map((optionId, index) => {
                    const isSelected = currentIds.includes(optionId);
                    const checkboxId = `${inputId}-checkbox-${index}`;
                    const name = selector.caption.get(optionId);

                    return (
                        <div
                            key={optionId}
                            className={classNames("widget-checkbox-radio-selection-checkbox-item", {
                                "widget-checkbox-radio-selection-checkbox-item-selected": isSelected
                            })}
                        >
                            <input
                                type="checkbox"
                                id={checkboxId}
                                name={name && name.length > 0 ? name : inputId}
                                value={optionId}
                                checked={isSelected}
                                disabled={isReadOnly}
                                tabIndex={tabIndex}
                                onChange={e => handleChange(optionId, e.target.checked)}
                            />
                            <CaptionContent htmlFor={checkboxId}>{selector.caption.render(optionId)}</CaptionContent>
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
