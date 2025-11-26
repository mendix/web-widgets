import { ActionValue } from "mendix";
import { action, computed, makeObservable, observable } from "mobx";
import { ClassAttributes, createRef, KeyboardEvent, KeyboardEventHandler, MouseEvent, MouseEventHandler } from "react";
import ReactDatePicker, { DatePickerProps, DatePicker } from "react-datepicker";

type DatePickerBackendProps = DatePickerProps & ClassAttributes<ReactDatePicker>;

interface PickerState {
    startDate: Date | undefined;
    endDate: Date | undefined;
    expanded: boolean;
    selectsRange: boolean;
}

type Params = {
    defaultStart?: Date;
    defaultEnd?: Date;
    onChange?: ActionValue<"none">;
    type: "date" | "time" | "datetime" | "range";
};

export class DatePickerController {
    private _dates: Array<Date | undefined>;
    private _timer = -1;
    private _defaultState: Array<Date | undefined>;
    private _type: "date" | "time" | "datetime" | "range";
    expanded = false;
    pickerRef = createRef<DatePicker>();

    constructor(params: Params) {
        this._dates = this.getDefaults(params);
        this._defaultState = this.getDefaults(params);
        this._type = params.type;

        // implement onChange action

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
        const isRange = this._type === "range";
        return {
            endDate: this._selectsRange ? this._dates[1] : undefined,
            expanded: this.expanded,
            selectsRange: isRange,
            startDate: this._dates[0]
        };
    }

    private get _selectsRange(): boolean {
        return this._type === "range";
    }

    handlePickerChange: DatePickerBackendProps["onChange"] = (value: Date | [Date | null, Date | null] | null) => {
        if (this._selectsRange) {
            const [start, end] = value as [Date | null, Date | null];
            this._dates[0] = start ?? undefined;
            this._dates[1] = end ?? undefined;
            return;
        } else {
            this._dates[0] = value as Date;
            return;
        }
    };

    handleCalendarOpen: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.expanded = true;
    };

    handleCalendarClose: DatePickerBackendProps["onCalendarOpen"] = () => {
        this.expanded = false;
    };

    /** We use mouse down to avoid race condition with calendar "outside click" event. */
    handleButtonMouseDown: MouseEventHandler = () => {
        if (this.expanded === false) {
            this._setActive();
        }
    };

    handleButtonKeyDown: KeyboardEventHandler = e => {
        if (e.code === "Enter" || e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            this._setActive();
        }
    };

    handleKeyDown: KeyboardEventHandler = event => {
        // Clear value on "Backspace" in range mode. Works only when focused on input.
        if (
            this._selectsRange &&
            (event.target as HTMLInputElement).nodeName === "INPUT" &&
            event.code === "Backspace"
        ) {
            this._dates = [undefined, undefined];
        }
    };

    /**
     * Prevent any input changes in range selection mode.
     * @remark
     * Don't change this method unless there no other way to solve your problem.
     * This method is just UX tweak that should prevent user confusion and have very low
     * value in widget behavior. Feel free to remove this method if you refactoring code.
     */
    UNSAFE_handleChangeRaw = (event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement> | undefined): void => {
        if (event?.type === "change" && this._selectsRange) {
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
        this._dates = this._defaultState;
    }

    private getDefaults(params: Params): Array<Date | undefined> {
        return params.type === "range" ? [params.defaultStart, params.defaultEnd] : [params.defaultStart, undefined];
    }
}
