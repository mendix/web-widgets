import { useOnResetValueEvent } from "@mendix/widget-plugin-external-events/hooks";
import { FilterSelector } from "@mendix/widget-plugin-filter-selector/FilterSelector";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import classNames from "classnames";
import { createElement, ReactElement, useState, useRef } from "react";
import { FilterTypeEnum } from "../helpers/base-types";
import { APIv2Props } from "../helpers/component-types";
import { DatePickerController } from "../helpers/DatePickerController";
import { ChangeEventHandler, FilterStore } from "../helpers/store/FilterStore";
import { PopupStore } from "../helpers/store/PopupStore";
import { useNewStore } from "../helpers/store/useNewStore";
import { useInitValues } from "../helpers/useInitValues";
import { DatePicker } from "./DatePicker";

export function FilterComponent(props: APIv2Props): ReactElement {
    const { id, filterStore, popupStore, datePickerController } = useSetup(props);
    useReset(props, filterStore);

    return (
        <div
            className={classNames("filter-container", props.class)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.style}
        >
            {props.adjustable && (
                <FilterSelector
                    ariaLabel={props.screenReaderButtonCaption?.value ?? "Select filter type"}
                    defaultFilter={filterStore.state.filterType}
                    id={id}
                    onChange={filterStore.setType}
                    options={OPTIONS}
                />
            )}
            <DatePicker
                adjustable={props.adjustable}
                parentId={id}
                placeholder={props.placeholder?.value}
                screenReaderCalendarCaption={props.screenReaderCalendarCaption?.value}
                screenReaderInputCaption={props.screenReaderInputCaption?.value}
                filterStore={filterStore}
                popupStore={popupStore}
                datePickerController={datePickerController}
            />
        </div>
    );
}

type SetupResult = {
    popupStore: PopupStore;
    filterStore: FilterStore;
    datePickerController: DatePickerController;
    id: string;
};

function useSetup(props: APIv2Props): SetupResult {
    const initValues = useInitValues(props);
    const popupStore = useNewStore(() => new PopupStore());
    const filterStore = useNewStore(() => {
        const { type, value, startDate, endDate } = initValues;
        const initState: FilterStore["state"] =
            type === "between"
                ? {
                      filterType: "between",
                      value: [startDate, endDate]
                  }
                : {
                      filterType: type,
                      value
                  };
        return new FilterStore(initState);
    });

    const [datePickerController] = useState(() => new DatePickerController(filterStore, popupStore));

    // Setup all the reactions/watches/effects;
    const [result] = useState<SetupResult>(() => {
        const { filterAPIClient } = props;

        const handleChange: ChangeEventHandler = event => {
            const { detail: state } = event;
            filterAPIClient.dispatch(state.filterType, state.value);
        };

        filterStore.addEventListener("change", handleChange);
        filterStore.addEventListener("init", handleChange);

        return {
            popupStore,
            filterStore,
            datePickerController,
            id: `DateFilter${generateUUID()}`
        };
    });

    return result;
}

type ResetEventParams = Parameters<typeof useOnResetValueEvent>[0];

function useReset(props: APIv2Props, filterStore: FilterStore): void {
    const pbox = useRef(props);
    pbox.current = props;

    const [resetParams] = useState<ResetEventParams>(() => ({
        widgetName: props.name,
        listener: (setDefault: boolean) => {
            if (setDefault) {
                const { defaultFilter, defaultValue, defaultEndDate, defaultStartDate } = pbox.current;
                const resetState: FilterStore["state"] =
                    defaultFilter === "between"
                        ? {
                              filterType: "between",
                              value: [defaultStartDate?.value ?? null, defaultEndDate?.value ?? null]
                          }
                        : {
                              filterType: defaultFilter,
                              value: defaultValue?.value ?? null
                          };

                filterStore.reset(resetState);
            } else {
                filterStore.reset();
            }
        }
    }));

    useOnResetValueEvent(resetParams);
}

const OPTIONS = [
    { value: "between", label: "Between" },
    { value: "greater", label: "Greater than" },
    { value: "greaterEqual", label: "Greater than or equal" },
    { value: "equal", label: "Equal" },
    { value: "notEqual", label: "Not equal" },
    { value: "smaller", label: "Smaller than" },
    { value: "smallerEqual", label: "Smaller than or equal" },
    { value: "empty", label: "Empty" },
    { value: "notEmpty", label: "Not empty" }
] as Array<{ value: FilterTypeEnum; label: string }>;
