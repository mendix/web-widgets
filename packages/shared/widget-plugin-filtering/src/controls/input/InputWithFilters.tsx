import { createElement, useRef, memo } from "react";
import classNames from "classnames";
import { FilterSelector } from "@mendix/widget-plugin-filter-selector/FilterSelector";
import { InputComponentProps } from "./typings";

// eslint-disable-next-line prefer-arrow-callback
export const InputWithFilters = memo(function InputWithFilters<TFilterEnum extends string>(
    props: InputComponentProps<TFilterEnum>
): React.ReactElement {
    const { current: defaultFilter } = useRef(props.defaultFilter);

    return (
        <div
            className={classNames("filter-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption}
                    id={props.id}
                    defaultFilter={defaultFilter}
                    onChange={props.onFilterChange}
                    options={props.filters}
                />
            )}
            <input
                aria-label={props.screenReaderInputCaption}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={props.inputDisabled}
                onChange={props.onInputChange}
                placeholder={props.placeholder}
                ref={props.inputRef}
                type={props.inputType}
                value={props.inputValue}
            />
        </div>
    );
});
