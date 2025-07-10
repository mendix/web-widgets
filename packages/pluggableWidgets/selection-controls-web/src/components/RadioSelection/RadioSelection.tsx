import classNames from "classnames";
import { ReactElement, createElement } from "react";
import { SelectionBaseProps, SingleSelector } from "../../helpers/types";

export function RadioSelection({
    selector,
    tabIndex = 0,
    inputId,
    ariaRequired,
    a11yConfig,
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

    if (selector.status === "unavailable") {
        return (
            <div className="widget-selection-controls-radio">
                <div className="widget-selection-controls-radio-loading">Loading...</div>
            </div>
        );
    }

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
                    const caption = selector.caption.get(optionId);
                    const isSelected = currentId === optionId;
                    const radioId = `${inputId}-radio-${index}`;

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
                                name={inputId}
                                value={optionId}
                                checked={isSelected}
                                disabled={isReadOnly}
                                tabIndex={tabIndex}
                                onChange={() => handleChange(optionId)}
                                aria-describedby={`${inputId}-description`}
                            />
                            <label htmlFor={radioId} className="widget-selection-controls-radio-label">
                                {selector.customContentType === "no"
                                    ? caption
                                    : selector.caption.render(optionId, "options")}
                            </label>
                        </div>
                    );
                })}
                {options.length === 0 && (
                    <div className="widget-selection-controls-no-options">No options available</div>
                )}
            </div>

            {/* Accessibility status message */}
            <div id={`${inputId}-description`} className="sr-only" aria-live="polite" aria-atomic="true">
                {currentId && `${a11yConfig.a11yStatusMessage.a11ySelectedValue} ${selector.caption.get(currentId)}`}
                {` ${a11yConfig.a11yStatusMessage.a11yOptionsAvailable} ${options.length}`}
                {` ${a11yConfig.a11yStatusMessage.a11yInstructions}`}
            </div>
        </div>
    );
}
