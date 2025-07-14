import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";
import { CaptionContent } from "../CaptionContent";

export function RadioSelection({
    selector,
    tabIndex = 0,
    inputId,
    ariaRequired,
    readOnlyStyle
}: SelectionBaseProps<SingleSelector>): ReactElement {
    const options = selector.options.getAll();
    const currentId = selector.currentId;
    const isReadOnly = selector.readOnly;

    const handleChange = (optionId: string): void => {
        if (!isReadOnly) {
            selector.setValue(optionId);
        }
    };

    return (
        <div
            className={classNames("widget-selection-controls-radio", {
                "widget-selection-controls-readonly": isReadOnly,
                [`widget-selection-controls-readonly-${readOnlyStyle}`]: isReadOnly
            })}
        >
            <div
                className="widget-selection-controls-radio-list"
                role="radiogroup"
                aria-labelledby={`${inputId}-label`}
                aria-required={ariaRequired?.value}
            >
                {options.map((optionId, index) => {
                    const isSelected = currentId === optionId;
                    const radioId = `${inputId}-radio-${index}`;
                    const name = selector.caption.get(optionId);

                    return (
                        <div
                            key={optionId}
                            className={classNames("widget-selection-controls-radio-item", {
                                "widget-selection-controls-radio-item-selected": isSelected
                            })}
                        >
                            <input
                                type="radio"
                                id={radioId}
                                name={name && name.length > 0 ? name : inputId}
                                value={optionId}
                                checked={isSelected}
                                disabled={isReadOnly}
                                tabIndex={tabIndex}
                                onChange={() => handleChange(optionId)}
                            />
                            <CaptionContent htmlFor={radioId}>{selector.caption.render(optionId)}</CaptionContent>
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
