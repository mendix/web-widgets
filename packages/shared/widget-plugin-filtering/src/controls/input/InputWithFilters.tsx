import { AllFunctions } from "@mendix/filter-commons/typings/FilterFunctions";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { FilterSelector } from "../filter-selector/FilterSelector";
import { InputComponentProps } from "./typings";

export function InputWithFiltersComponent<Fn extends AllFunctions>(props: InputComponentProps<Fn>): React.ReactElement {
    const {
        inputStores: [input1]
    } = props;
    return (
        <div
            className={classNames("filter-container", props.className, { "has-error": !input1.isValid })}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption}
                    value={props.filterFn}
                    onSelect={props.onFilterChange}
                    options={props.filterFnList}
                />
            )}
            <input
                aria-invalid={input1.isValid ? undefined : true}
                aria-label={props.screenReaderInputCaption || "filter"}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={props.disableInputs}
                onChange={input1.onChange}
                placeholder={props.placeholder}
                ref={props.inputRef}
                value={input1.value}
                type="text"
            />
        </div>
    );
}

export const InputWithFilters = observer(InputWithFiltersComponent);
