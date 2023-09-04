import { createElement, CSSProperties, ReactElement, memo, useRef, ChangeEventHandler } from "react";
import { FilterSelector } from "@mendix/widget-plugin-filter-selector/FilterSelector";
import { useFilterState, useStateChangeEffects } from "../features/filter-state";
import { useSetInitialConditionEffect } from "../features/initialize";
import { FilterType } from "../../typings/FilterType";
import classNames from "classnames";

interface FilterProps {
    adjustable: boolean;
    initialFilterType: FilterType;
    className?: string;
    id?: string;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    tabIndex?: number;
    styles?: CSSProperties;
}

interface FilterComponentProps extends FilterProps {
    inputChangeDelay: number;
    initialFilterValue?: string;
    updateFilters?: (value: string | undefined, type: FilterType) => void;
}

interface FilterInputProps extends FilterProps {
    onFilterTypeClick: (type: FilterType) => void;
    onInputChange: ChangeEventHandler<HTMLInputElement>;
    inputValue: string;
    inputRef?: React.ClassAttributes<HTMLInputElement>["ref"];
    inputDisabled?: boolean;
}

function FilterInput(props: FilterInputProps): ReactElement {
    const { current: initialFilterType } = useRef(props.initialFilterType);

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
                    defaultFilter={initialFilterType}
                    onChange={props.onFilterTypeClick}
                    options={
                        [
                            { value: "contains", label: "Contains" },
                            { value: "startsWith", label: "Starts with" },
                            { value: "endsWith", label: "Ends with" },
                            { value: "greater", label: "Greater than" },
                            { value: "greaterEqual", label: "Greater than or equal" },
                            { value: "equal", label: "Equal" },
                            { value: "notEqual", label: "Not equal" },
                            { value: "smaller", label: "Smaller than" },
                            { value: "smallerEqual", label: "Smaller than or equal" },
                            { value: "empty", label: "Empty" },
                            { value: "notEmpty", label: "Not empty" }
                        ] as Array<{ value: FilterType; label: string }>
                    }
                />
            )}
            <input
                aria-label={props.screenReaderInputCaption}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={props.inputDisabled}
                onChange={props.onInputChange}
                placeholder={props.placeholder}
                ref={props.inputRef}
                type="text"
                value={props.inputValue}
            />
        </div>
    );
}

const PureFilterInput = memo(FilterInput);

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const [state, onInputChange, onFilterTypeClick] = useFilterState(() => ({
        inputValue: props.initialFilterValue ?? "",
        type: props.initialFilterType
    }));
    const [inputRef] = useStateChangeEffects(state, (a, b) => props.updateFilters?.(a, b), props.inputChangeDelay);

    useSetInitialConditionEffect(props);

    return (
        <PureFilterInput
            initialFilterType={props.initialFilterType}
            onFilterTypeClick={onFilterTypeClick}
            onInputChange={onInputChange}
            inputRef={inputRef}
            inputValue={state.inputValue}
            inputDisabled={state.type === "empty" || state.type === "notEmpty"}
            adjustable={props.adjustable}
            className={props.className}
            id={props.id}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={props.styles}
            tabIndex={props.tabIndex}
        />
    );
}
