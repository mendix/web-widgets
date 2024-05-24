import { createRef } from "react";
import { FilterStore } from "./store/FilterStore";
import { CalendarStore } from "./store/CalendarStore";
import { isDate, isValid } from "date-fns";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";

interface DatePickerBackendProps extends ReactDatePickerProps, React.ClassAttributes<ReactDatePicker> {}

type Value = Date | null | [Date | null, Date | null];

export class DatePickerController {
    pickerRef: React.RefObject<ReactDatePicker> = createRef();

    #filterStore: FilterStore;
    #calendarStore: CalendarStore;

    #timer: number = -1;

    constructor(filterStore: FilterStore, calendarStore: CalendarStore) {
        this.#filterStore = filterStore;
        this.#calendarStore = calendarStore;
        this.#setupTypeWatch(filterStore);
    }

    handlePickerChange: DatePickerBackendProps["onChange"] = (value: Value) => {
        if (isDate(value)) {
            value = isValid(value) ? value : null;
        }
        this.#filterStore.setValue(value);
    };

    handleCalendarOpen: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.#calendarStore.UNSAFE_setExpanded(true);
    };

    handleCalendarClose: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.#calendarStore.UNSAFE_setExpanded(false);
    };

    /** We use mouse down to avoid race condition with calendar "outside click" event. */
    handleButtonMouseDown: React.MouseEventHandler = () => {
        if (this.#calendarStore.state.expanded === false) {
            this.#setActive();
        }
    };

    handleButtonKeyDown: React.KeyboardEventHandler = e => {
        if (e.code === "Enter" || e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            this.#setActive();
        }
    };

    handleKeyDown: React.KeyboardEventHandler = event => {
        // Clear value on "Backspace" in range mode. Works only when focused on input.
        if (
            this.#selectsRange &&
            (event.target as HTMLInputElement).nodeName === "INPUT" &&
            event.code === "Backspace"
        ) {
            this.#filterStore.setValue([null, null]);
        }
    };

    /**
     * Prevent any input changes in range selection mode.
     * @remark
     * Don't change this method unless there no other way to solve your problem.
     * This method is just UX tweak that should prevent user confusion and have very low
     * value in widget behavior. Feel free to remove this method if you refactoring code.
     */
    UNSAFE_handleChangeRaw = (event: React.BaseSyntheticEvent): void => {
        if (event.type === "change" && this.#selectsRange) {
            event.preventDefault();
        }
    };

    get #selectsRange(): boolean {
        return this.#filterStore.state.filterType === "between";
    }

    #setActive(): void {
        const picker = this.pickerRef.current;
        clearTimeout(this.#timer);
        // Run setFocus on next tick to prevent calling focus on disabled element.
        this.#timer = window.setTimeout(() => {
            picker?.setFocus();
            this.#timer = -1;
        }) as number;
    }

    #setupTypeWatch(store: FilterStore): void {
        let lastType = store.state.filterType;
        store.addEventListener("change", event => {
            const { detail: state } = event;
            if (lastType !== state.filterType) {
                this.#setActive();
                lastType = state.filterType;
            }
        });
    }
}
