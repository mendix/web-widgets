import { createRef } from "react";
import { FilterStore } from "./store/FilterStore";
import { PopupStore } from "./store/PopupStore";
import { isDate, isValid } from "date-fns";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";

interface DatePickerBackendProps extends ReactDatePickerProps, React.ClassAttributes<ReactDatePicker> {}

type Value = Date | null | [Date | null, Date | null];

export class DatePickerController {
    pickerRef: React.RefObject<ReactDatePicker> = createRef();
    popoverContainerRef: React.RefObject<HTMLDivElement> = createRef();
    buttonRef: React.RefObject<HTMLButtonElement> = createRef();

    #filterStore: FilterStore;
    #popupStore: PopupStore;

    #timer: number = -1;

    constructor(filterStore: FilterStore, popupStore: PopupStore) {
        this.#filterStore = filterStore;
        this.#popupStore = popupStore;
        this.#setupTypeWatch(filterStore);
    }

    handlePickerChange: DatePickerBackendProps["onChange"] = (value: Value) => {
        if (isDate(value)) {
            value = isValid(value) ? value : null;
        }
        this.#filterStore.setValue(value);
    };

    handleCalendarOpen: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.#popupStore.setOpen(true);
    };

    handleCalendarClose: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.#popupStore.setOpen(false);
    };

    /** We use mouse down to avoid race condition with calendar "outside click" event. */
    handleButtonMouseDown: React.MouseEventHandler = () => {
        if (this.#popupStore.state.open === false) {
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

    /**
     * Prevent any input changes in range selection mode.
     * @remark
     * Don't change this method unless there no other way to solve your problem.
     * This method is just UX tweak that should prevent user confusion and have very low
     * value in widget behavior. Feel free to remove this method if you refactoring code.
     */
    UNSAFE_handleChangeRaw = (event: React.BaseSyntheticEvent): void => {
        if (event.type === "change" && this.#selectsRange) {
            const value = event.target?.value;
            if (value !== "") {
                event.preventDefault();
            }
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
