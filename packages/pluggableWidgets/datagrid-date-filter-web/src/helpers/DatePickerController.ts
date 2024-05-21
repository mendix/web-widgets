import { createRef } from "react";
import { FilterStore } from "./store/FilterStore";
import { PopupStore } from "./store/PopupStore";
import { isDate, isValid } from "date-fns";
import ReactDatePicker from "react-datepicker";
import { DatePickerBackendProps } from "./component-types";

type Value = Date | null | [Date | null, Date | null];

export class DatePickerController {
    pickerRef: React.RefObject<ReactDatePicker> = createRef();
    popoverContainerRef: React.RefObject<HTMLDivElement> = createRef();
    buttonRef: React.RefObject<HTMLButtonElement> = createRef();

    #filterStore: FilterStore;
    #popupStore: PopupStore;

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

    handlePickerOutsideClick: DatePickerBackendProps["onClickOutside"] = event => {
        if (!this.buttonRef.current || this.buttonRef.current.contains(event.target as Node)) {
            return;
        }
        this.#popupStore.setOpen(false);
    };

    handlePickerInputClick: DatePickerBackendProps["onInputClick"] = () => {
        this.#popupStore.setOpen(true);
    };

    handleCalendarOpen: DatePickerBackendProps["onCalendarOpen"] = () => {
        (this.popoverContainerRef.current?.querySelector(".react-datepicker > button") as HTMLElement)?.focus();
    };

    handleButtonClick: React.MouseEventHandler = () => {
        this.#popupStore.toggle();
    };

    handleButtonKeyDown: React.KeyboardEventHandler = e => {
        if (e.code === "Enter" || e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            this.#popupStore.toggle();
        }
    };

    #setupTypeWatch(store: FilterStore): void {
        let lastType = store.state.filterType;
        store.addEventListener("change", event => {
            const { detail: state } = event;
            if (lastType !== state.filterType) {
                lastType = state.filterType;
                this.pickerRef.current?.setFocus();
            }
        });
    }
}
