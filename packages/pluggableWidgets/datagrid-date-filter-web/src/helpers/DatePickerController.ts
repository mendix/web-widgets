import { reaction, makeObservable, action, IReactionDisposer } from "mobx";
import { createRef } from "react";
import { CalendarStore } from "./CalendarStore";
import { isDate } from "date-fns/isDate";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering/dist/stores/typings/InputFilterInterface";

interface DatePickerBackendProps extends ReactDatePickerProps, React.ClassAttributes<ReactDatePicker> {}

export class DatePickerController {
    pickerRef: React.RefObject<ReactDatePicker> = createRef();

    private _filterStore: Date_InputFilterInterface;
    private _calendarStore: CalendarStore;
    private _timer: number = -1;

    constructor(filterStore: Date_InputFilterInterface, calendarStore: CalendarStore) {
        this._filterStore = filterStore;
        this._calendarStore = calendarStore;

        makeObservable(this, {
            handlePickerChange: action,
            handleCalendarOpen: action,
            handleCalendarClose: action,
            handleKeyDown: action
        });
    }

    handlePickerChange: DatePickerBackendProps["onChange"] = (value: Date | [Date | null, Date | null] | null) => {
        if (isDate(value)) {
            this._filterStore.arg1.value = value;
            return;
        }

        if (value === null) {
            [this._filterStore.arg1.value, this._filterStore.arg2.value] = [undefined, undefined];
            return;
        }

        const [start, end] = value;
        this._filterStore.arg1.value = start ?? undefined;
        this._filterStore.arg2.value = end ?? undefined;
    };

    handleCalendarOpen: DatePickerBackendProps["onCalendarOpen"] = () => {
        this._calendarStore.UNSAFE_setExpanded(true);
    };

    handleCalendarClose: DatePickerBackendProps["onCalendarOpen"] = () => {
        this._calendarStore.UNSAFE_setExpanded(false);
    };

    /** We use mouse down to avoid race condition with calendar "outside click" event. */
    handleButtonMouseDown: React.MouseEventHandler = () => {
        if (this._calendarStore.expanded === false) {
            this._setActive();
        }
    };

    handleButtonKeyDown: React.KeyboardEventHandler = e => {
        if (e.code === "Enter" || e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            this._setActive();
        }
    };

    handleKeyDown: React.KeyboardEventHandler = event => {
        // Clear value on "Backspace" in range mode. Works only when focused on input.
        if (
            this._selectsRange &&
            (event.target as HTMLInputElement).nodeName === "INPUT" &&
            event.code === "Backspace"
        ) {
            this._filterStore.clear();
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
        if (event.type === "change" && this._selectsRange) {
            event.preventDefault();
        }
    };

    private get _selectsRange(): boolean {
        return this._filterStore.filterFunction === "between";
    }

    private _setActive(): void {
        const picker = this.pickerRef.current;
        clearTimeout(this._timer);
        // Run setFocus on next tick to prevent calling focus on disabled element.
        this._timer = window.setTimeout(() => {
            picker?.setFocus();
            this._timer = -1;
        }) as number;
    }

    setup(): IReactionDisposer {
        return reaction(() => this._filterStore.filterFunction, this._setActive.bind(this));
    }
}
