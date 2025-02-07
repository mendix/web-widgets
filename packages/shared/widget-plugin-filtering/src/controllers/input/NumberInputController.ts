import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { action, autorun, computed, makeObservable, reaction, runInAction } from "mobx";
import { createRef } from "react";
import { InputStore } from "../../stores/input/InputStore";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../../typings/FilterFunctions";
import { FilterV, Number_InputFilterInterface } from "../../typings/InputFilterInterface";

export type Params = {
    filter: Number_InputFilterInterface;
    defaultFilter: NumberFilterFunction;
    defaultValue?: FilterV<Number_InputFilterInterface>;
    changeDelay?: number;
    disableInputs?: (fn: NumberFilterFunction) => boolean;
};

type NumberFilterFunction = FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;

export class NumberFilterController {
    private filter: Number_InputFilterInterface;
    private readonly changeDelay;
    private disabledFn?: (fn: NumberFilterFunction) => boolean;
    input1: InputStore;
    input2: InputStore;
    inputRef = createRef<HTMLInputElement>();
    defaults: Number_InputFilterInterface["defaultState"];
    inputs: [InputStore, InputStore];

    constructor(params: Params) {
        const { filter, changeDelay = 500 } = params;
        this.changeDelay = changeDelay;
        this.input1 = new InputStore(filter.arg1.displayValue);
        this.input2 = new InputStore(filter.arg2.displayValue);
        this.inputs = [this.input1, this.input2];
        this.filter = filter;
        this.defaults = [params.defaultFilter, params.defaultValue];
        this.disabledFn = params.disableInputs;

        makeObservable(this, {
            selectedFn: computed,
            disableInputs: computed,
            handleFilterFnChange: action,
            handleResetValue: action,
            handleSetValue: action
        });
    }

    get selectedFn(): NumberFilterFunction {
        return this.filter.filterFunction;
    }

    get disableInputs(): boolean {
        return this.disabledFn ? this.disabledFn(this.filter.filterFunction) : false;
    }

    handleFilterFnChange = (fn: NumberFilterFunction): void => {
        this.filter.filterFunction = fn;
        if (fn === "empty" || fn === "notEmpty") {
            this.input1.setValue("");
        }
        this.inputRef.current?.focus();
    };

    setup(): () => void {
        const disposers: Array<() => void> = [];
        // onInputsChange - debounced reaction (effect) for both inputs.
        // Triggered whenever one of the inputs is changed.
        // This reaction writes value to filter.
        const [onInputsChange, clearDebounce] = debounce(([v1, v2]: [string, string]) => {
            runInAction(() => {
                this.filter.arg1.displayValue = v1;
                this.filter.arg2.displayValue = v2;
            });
        }, this.changeDelay);

        disposers.push(clearDebounce);

        disposers.push(
            reaction(() => {
                return [this.input1.value, this.input2.value];
            }, onInputsChange)
        );

        // Autorun to sync filter args with inputs.
        // Runs whenever one of the argument value is changed.
        disposers.push(
            autorun(() => {
                this.input1.setValue(this.filter.arg1.displayValue);
                this.input2.setValue(this.filter.arg2.displayValue);
            })
        );

        // Set default state for the filter, if present.
        this.filter.UNSAFE_setDefaults(this.defaults);

        return () => {
            disposers.forEach(dispose => dispose());
        };
    }

    handleResetValue = (useDefaultValue: boolean): void => {
        if (useDefaultValue) {
            this.filter.reset();
            return;
        }
        this.filter.clear();
    };

    handleSetValue = (
        useDefaultValue: boolean,
        params: { operators: any; stringValue: string; numberValue: Big.Big; dateTimeValue: Date; dateTimeValue2: Date }
    ): void => {
        if (useDefaultValue) {
            this.filter.reset();
            return;
        }
        if (params.operators) {
            this.filter.filterFunction = params.operators;
        }
        this.filter.arg1.value = params.numberValue;
    };
}
