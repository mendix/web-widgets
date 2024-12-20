import classNames from "classnames";
import { Fragment, UIEventHandler, createElement } from "react";
import { OptionWithState } from "../../typings/OptionListFilterInterface";

interface FilterContentProps {
    footer?: JSX.Element;
    id?: string;
    options: OptionWithState[];
    empty: OptionWithState;
    multiSelect: boolean;
    onContentScroll?: UIEventHandler<HTMLUListElement>;
    onOptionClick: (option: OptionWithState) => void;
    onBlur: () => void;
    position: DOMRect | undefined;
    width?: number;
    rootRef?: React.RefObject<HTMLDivElement>;
}

export function FilterContentComponent(props: FilterContentProps): React.ReactElement {
    const { footer, id, options, multiSelect, onContentScroll, onOptionClick, onBlur, position, width } = props;
    const hasOptions = options.length > 0;
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
            <li
                key="empty-item"
                role="menuitem"
                tabIndex={0}
                style={multiSelect ? { paddingLeft: 32 } : undefined}
                onClick={e => {
                    e.stopPropagation();
                    onOptionClick(props.empty);
                }}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onOptionClick(props.empty);
                    } else if ((e.key === "Tab" && e.shiftKey) || e.key === "Escape") {
                        e.preventDefault();
                        onBlur();
                    }
                }}
            >
                <div className="filter-label">{props.empty.caption}</div>
            </li>
            {options.map((option, index) => (
                <li
                    className={classNames({
                        "filter-selected": !multiSelect && option.selected
                    })}
                    key={`val:${option.value}`}
                    onClick={e => {
                        e.stopPropagation();
                        onOptionClick(option);
                    }}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            onOptionClick(option);
                        } else if ((e.key === "Tab" && index + 1 === options.length) || e.key === "Escape") {
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
                                checked={option.selected}
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
        <div className="dropdown-content" ref={props.rootRef}>
            {optionsList}
            {footer}
        </div>
    );
}

function preventReactErrorsAboutReadOnly(): void {
    return undefined;
}
