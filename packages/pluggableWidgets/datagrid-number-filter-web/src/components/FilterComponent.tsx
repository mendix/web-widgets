import { createElement, ReactElement, useRef, memo } from "react";
import { FilterSelector } from "@mendix/widget-plugin-filter-selector/FilterSelector";
import { FilterType } from "../../typings/FilterType";
import classNames from "classnames";
import { FilterInputProps, FilterComponentProps } from "../components/typings";
import { useFilter } from "../helpers/useFilter";

const selectorOptions = [
    { value: "greater", label: "Greater than" },
    { value: "greaterEqual", label: "Greater than or equal" },
    { value: "equal", label: "Equal" },
    { value: "notEqual", label: "Not equal" },
    { value: "smaller", label: "Smaller than" },
    { value: "smallerEqual", label: "Smaller than or equal" },
    { value: "empty", label: "Empty" },
    { value: "notEmpty", label: "Not empty" }
] as Array<{ value: FilterType; label: string }>;

function FilterInput(props: FilterInputProps): ReactElement {
    const { current: defaultFilterType } = useRef(props.defaultFilterType);

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
                    defaultFilter={defaultFilterType}
                    onChange={props.onFilterTypeClick}
                    options={selectorOptions}
                />
            )}
            <input
                aria-label={props.screenReaderInputCaption}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={props.inputDisabled}
                onChange={props.onInputChange}
                placeholder={props.placeholder}
                ref={props.inputRef}
                type="number"
                value={props.inputValue}
            />
        </div>
    );
}

const PureFilterInput = memo(FilterInput);

export function FilterComponent(props: FilterComponentProps): ReactElement {
    return <PureFilterInput {...useFilter(props)} />;
}
