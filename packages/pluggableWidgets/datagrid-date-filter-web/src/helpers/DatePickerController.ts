import { makeObservable, action, observable, computed, runInAction } from "mobx";
import { createRef } from "react";
import { isDate } from "date-fns/isDate";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import { Date_InputFilterInterface, FilterFn } from "@mendix/widget-plugin-filtering/typings/InputFilterInterface";
import { SetFilterValueArgs } from "@mendix/widget-plugin-external-events/typings";

interface DatePickerBackendProps extends ReactDatePickerProps, React.ClassAttributes<ReactDatePicker> {}

interface PickerState {
    startDate: Date | undefined;
    endDate: Date | undefined;
    selected: Date | undefined;
    expanded: boolean;
    selectsRange: boolean;
    disabled: boolean;
    filterFn: Date_InputFilterInterface["filterFunction"];
}

type Params = {
    filter: Date_InputFilterInterface;
    defaultFilter: FilterFn<Date_InputFilterInterface>;
    defaultValue?: Date;
    defaultStart?: Date;
    defaultEnd?: Date;
};

export class DatePickerController {
    private _filter: Date_InputFilterInterface;
    private _timer = -1;
    private _defaultState: Date_InputFilterInterface["defaultState"];
    expanded = false;
    pickerRef = createRef<ReactDatePicker>();

    constructor(params: Params) {
        this._filter = params.filter;
        this._defaultState = this.getDefaults(params);

        makeObservable(this, {
            pickerState: computed,
            expanded: observable,
            handlePickerChange: action,
            handleCalendarOpen: action,
            handleCalendarClose: action,
            handleKeyDown: action
        });
    }

    get pickerState(): PickerState {
        const fn = this._filter.filterFunction;
        const isRange = fn === "between";
        return {
            disabled: fn === "empty" || fn === "notEmpty",
            endDate: isRange ? this._filter.arg2.value : undefined,
            expanded: this.expanded,
            selected: isRange ? undefined : this._filter.arg1.value,
            selectsRange: isRange,
            startDate: isRange ? this._filter.arg1.value : undefined,
            filterFn: fn
        };
    }

    private get _selectsRange(): boolean {
        return this._filter.filterFunction === "between";
    }

    handlePickerChange: DatePickerBackendProps["onChange"] = (value: Date | [Date | null, Date | null] | null) => {
        if (isDate(value)) {
            this._filter.arg1.value = value;
            return;
        }

        if (value === null) {
            [this._filter.arg1.value, this._filter.arg2.value] = [undefined, undefined];
            return;
        }

        const [start, end] = value;
        this._filter.arg1.value = start ?? undefined;
        this._filter.arg2.value = end ?? undefined;
    };

    handleCalendarOpen: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.expanded = true;
    };

    handleCalendarClose: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.expanded = false;
    };

    /** We use mouse down to avoid race condition with calendar "outside click" event. */
    handleButtonMouseDown: React.MouseEventHandler = () => {
        if (this.expanded === false) {
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
            this._filter.clear();
        }
    };

    handleReset = (useDefaults: boolean): void => {
        if (useDefaults) {
            this._filter.reset();
        } else {
            this._filter.clear();
        }
    };

    handleSetValue = (useDefaults: boolean, valueOptions: SetFilterValueArgs): void => {
        if (useDefaults) {
            this._filter.reset();
        } else {
            runInAction(() => {
                this._filter.setFilterFn(valueOptions.operators as Date_InputFilterInterface["filterFunction"]);
                this._filter.arg1.value = valueOptions.dateTimeValue;
                this._filter.arg2.value = valueOptions.dateTimeValue2;
            });
        }
    };

    handleFilterChange = (fn: FilterFn<Date_InputFilterInterface>): void => {
        this._filter.setFilterFn(fn);
        this._setActive();
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

    private _setActive(): void {
        const picker = this.pickerRef.current;
        clearTimeout(this._timer);
        // Run setFocus on next tick to prevent calling focus on disabled element.
        this._timer = window.setTimeout(() => {
            picker?.setFocus();
            this._timer = -1;
        }) as number;
    }

    setup(): (() => void) | void {
        this._filter.UNSAFE_setDefaults(this._defaultState);
    }

    private getDefaults(params: Params): Date_InputFilterInterface["defaultState"] {
        return params.defaultFilter === "between"
            ? [params.defaultFilter, params.defaultStart, params.defaultEnd]
            : [params.defaultFilter, params.defaultValue];
    }
}
