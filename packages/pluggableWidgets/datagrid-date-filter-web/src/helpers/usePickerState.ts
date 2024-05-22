import { FilterStore } from "./store/FilterStore";
import { PopupStore } from "./store/PopupStore";
import { useStore } from "./store/useStore";

type Value = Date | null | undefined;

interface PickerState {
    startDate: Value;
    endDate: Value;
    selected: Value;
    expanded: boolean;
    selectsRange: boolean;
    disabled: boolean;
}

export function usePickerState(filterStore: FilterStore, popupStore: PopupStore): PickerState {
    const expanded = useStore(popupStore, state => state.open);
    const values = useStore(filterStore, ({ value, filterType }) => {
        const isRange = Array.isArray(value);
        return {
            disabled: filterType === "empty" || filterType === "notEmpty",
            selected: isRange ? undefined : value,
            startDate: isRange ? value[0] : undefined,
            endDate: isRange ? value[1] : undefined,
            selectsRange: isRange
        };
    });

    return {
        expanded,
        ...values
    };
}
