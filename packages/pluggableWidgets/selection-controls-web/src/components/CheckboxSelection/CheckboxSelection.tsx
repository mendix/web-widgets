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

    if (selector.status === "unavailable") {
        return (
            <div className="widget-selection-controls-checkbox">
                <div className="widget-selection-controls-checkbox-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div
            className={classNames("widget-selection-controls-checkbox", {
                "widget-selection-controls-readonly": isReadOnly,
                [`widget-selection-controls-readonly-${readOnlyStyle}`]: isReadOnly
            })}
        >
            <div
                className="widget-selection-controls-checkbox-list"
                role="group"
                aria-labelledby={`${inputId}-label`}
                aria-required={ariaRequired?.value}
            >
                {options.map((optionId, index) => {
                    const isSelected = currentIds.includes(optionId);
                    const checkboxId = `${inputId}-checkbox-${index}`;

                    return (
                        <div
                            key={optionId}
                            className={classNames("widget-selection-controls-checkbox-item", {
                                "widget-selection-controls-checkbox-item-selected": isSelected
                            })}
                        >
                            <input
                                type="checkbox"
                                id={checkboxId}
                                value={optionId}
                                checked={isSelected}
                                disabled={isReadOnly}
                                tabIndex={tabIndex}
                                onChange={e => handleChange(optionId, e.target.checked)}
                                aria-describedby={`${inputId}-description`}
                            />
                            <CaptionContent htmlFor={checkboxId}>{selector.caption.render(optionId)}</CaptionContent>
                        </div>
                    );
                })}
                {options.length === 0 && (
                    <div className="widget-selection-controls-no-options">No options available</div>
                )}
            </div>
        </div>
    );
}
