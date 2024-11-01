import { FilterSelector } from "@mendix/widget-plugin-filter-selector/FilterSelector";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { AllFunctions } from "../../typings/FilterFunctions";
import { Badge } from "../shared";
import { InputComponentProps } from "./typings";

export function InputWithFiltersComponent<Fn extends AllFunctions>(props: InputComponentProps<Fn>): React.ReactElement {
    const {
        inputStores: [input1]
    } = props;
    return (
        <div
            className={classNames("filter-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            {props.badge ? <Badge style={{ left: 40 }}>{props.badge}</Badge> : null}
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption}
                    id={props.id}
                    value={props.filterFn}
                    onChange={props.onFilterChange}
                    options={props.filterFnList}
                />
            )}
            <input
                aria-label={props.screenReaderInputCaption}
                className={classNames("form-control", { "filter-input": props.adjustable })}
                disabled={props.disableInputs}
                onChange={input1.onChange}
                placeholder={props.placeholder}
                ref={props.inputRef}
                type={props.type}
                value={input1.value}
            />
        </div>
    );
}
// eslint-disable-next-line prefer-arrow-callback
export const InputWithFilters = observer(InputWithFiltersComponent);
