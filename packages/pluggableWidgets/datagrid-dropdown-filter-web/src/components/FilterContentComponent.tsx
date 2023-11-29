import classNames from "classnames";
import { Fragment, ReactElement, RefObject, UIEventHandler, createElement, forwardRef } from "react";
import { preventReactErrorsAboutReadOnly } from "../utils/helper";
import { Option, OptionValue } from "../utils/types";

function within(selected: OptionValue[]): (value: OptionValue) => boolean {
    return value => selected.includes(value);
}

interface FilterContentProps {
    footer?: JSX.Element;
    id?: string;
    options: Option[];
    multiSelect: boolean;
    onContentScroll?: UIEventHandler<HTMLUListElement>;
    selected: OptionValue[];
    onOptionClick: (option: Option) => void;
    onBlur: () => void;
    position: DOMRect | undefined;
    width?: number;
}

export const FilterContentComponent = forwardRef(
    (props: FilterContentProps, ref: RefObject<HTMLDivElement>): ReactElement => {
        const { footer, id, options, multiSelect, onContentScroll, selected, onOptionClick, onBlur, position, width } =
            props;
        const hasOptions = options.length > 0;
        const isSelected = within(selected);
        const optionsList = hasOptions ? (
            <ul
                id={`${id}-dropdown-list`}
                className="dropdown-list dropdown-content-section"
                role="menu"
                onScroll={onContentScroll}
                data-focusindex={0}
                style={{
                    position: "fixed",
                    width,
                    top: position?.bottom,
                    left: position?.left
                }}
            >
                {options.map((option, index) => (
                    <li
                        className={classNames({
                            "filter-selected": !multiSelect && isSelected(option.value)
                        })}
                        key={`val:${option.value}`}
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOptionClick(option);
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                onOptionClick(option);
                            } else if (
                                (e.key === "Tab" && (index + 1 === options.length || (e.shiftKey && index === 0))) ||
                                e.key === "Escape"
                            ) {
                                e.preventDefault();
                                onBlur();
                            }
                        }}
                        title={option.caption}
                        role="menuitem"
                        tabIndex={0}
                    >
                        {multiSelect ? (
                            <Fragment>
                                <input
                                    id={`${id}_checkbox_toggle_${index}`}
                                    type="checkbox"
                                    checked={isSelected(option.value)}
                                    onChange={preventReactErrorsAboutReadOnly}
                                />
                                <label htmlFor={`${id}_checkbox_toggle_${index}`} style={{ pointerEvents: "none" }}>
                                    {option.caption}
                                </label>
                            </Fragment>
                        ) : (
                            <div className="filter-label">{option.caption}</div>
                        )}
                    </li>
                ))}
            </ul>
        ) : null;

        return (
            <div className="dropdown-content" ref={ref}>
                {optionsList}
                {footer}
            </div>
        );
    }
);
