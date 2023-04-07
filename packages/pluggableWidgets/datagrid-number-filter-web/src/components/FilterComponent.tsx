import { ChangeEventHandler, createElement, CSSProperties, ReactElement, useRef, memo } from "react";
import { FilterSelector } from "@mendix/pluggable-widgets-commons/components/web";
import { useId, useLog, usePropInspect } from "@mendix/pluggable-widgets-commons";

import { DefaultFilterEnum } from "../../typings/DatagridNumberFilterProps";
import { Big } from "big.js";
import classNames from "classnames";
import { useFilterState, useStateChangeEffects } from "../features/filter-state";

type FilterType = DefaultFilterEnum;

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
    updateFilters?: (value: Big | undefined, type: DefaultFilterEnum) => void;
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
    const id = useId("PureNumberFilter");
    usePropInspect(id)(props);

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
                            { value: "greater", label: "Greater than" },
                            { value: "greaterEqual", label: "Greater than or equal" },
                            { value: "equal", label: "Equal" },
                            { value: "notEqual", label: "Not equal" },
                            { value: "smaller", label: "Smaller than" },
                            { value: "smallerEqual", label: "Smaller than or equal" },
                            { value: "empty", label: "Empty" },
                            { value: "notEmpty", label: "Not empty" }
                        ] as Array<{ value: DefaultFilterEnum; label: string }>
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
                type="number"
                value={props.inputValue}
            />
        </div>
    );
}

const PureFilterInput = memo(FilterInput);

export function FilterComponent(props: FilterComponentProps): ReactElement {
    const [state, onInputChange, onFilterTypeClick] = useFilterState(() => ({ inputValue: "5", type: "greater" }));
    const [inputRef] = useStateChangeEffects(state, (a, b) => props.updateFilters?.(a, b));

    const log = useLog("FilterComponent");
    log("Rerender");
    return (
        <PureFilterInput
            {...props}
            initialFilterType="greater"
            onFilterTypeClick={onFilterTypeClick}
            onInputChange={onInputChange}
            inputRef={inputRef}
            inputValue={state.inputValue}
            inputDisabled={state.type === "empty" || state.type === "notEmpty"}
        />
    );
}
