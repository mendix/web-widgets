import { CalendarStore } from "./store/CalendarStore";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering";

interface PickerState {
    startDate: Date | undefined;
    endDate: Date | undefined;
    selected: Date | undefined;
    expanded: boolean;
    selectsRange: boolean;
    disabled: boolean;
    filterFn: Date_InputFilterInterface["filterFunction"];
}

export function usePickerState(filterStore: Date_InputFilterInterface, calendarStore: CalendarStore): PickerState {
    const fn = filterStore.filterFunction;
    const isRange = fn === "between";

    return {
        disabled: fn === "empty" || fn === "notEmpty",
        endDate: isRange ? filterStore.arg2.value : undefined,
        expanded: calendarStore.expanded,
        selected: isRange ? undefined : filterStore.arg1.value,
        selectsRange: isRange,
        startDate: isRange ? filterStore.arg1.value : undefined,
        filterFn: fn
    };
}
