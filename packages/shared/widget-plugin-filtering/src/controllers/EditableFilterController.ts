import { createRef } from "react";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { action, autorun, computed, makeObservable, reaction, runInAction } from "mobx";
import { InputStore } from "../stores/InputStore";
import { ArgumentInterface } from "../typings/ArgumentInterface";
import { AllFunctions } from "../typings/FilterFunctions";
import { FilterFn, FilterV, InputFilterBaseInterface } from "../typings/InputFilterInterface";

export type Params<F extends InputFilterBaseInterface<A, Fn>, A extends ArgumentInterface, Fn extends AllFunctions> = {
    filter: F;
    defaultFilter: FilterFn<F>;
    defaultValue?: FilterV<F>;
    changeDelay?: number;
    disableInputs?: (fn: FilterFn<F>) => boolean;
};

export class EditableFilterController<
    F extends InputFilterBaseInterface<A, Fn>,
    A extends ArgumentInterface,
    Fn extends AllFunctions
> {
    private filter: F;
    private readonly changeDelay;
    private disabledFn?: (fn: Fn) => boolean;
    input1: InputStore;
    input2: InputStore;
    inputRef = createRef<HTMLInputElement>();
    defaults: F["defaultState"];
    inputs: [InputStore, InputStore];

    constructor(params: Params<F, A, Fn>) {
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
            handleFilterFnChange: action
        });
    }

    get selectedFn(): Fn {
        return this.filter.filterFunction;
    }

    get disableInputs(): boolean {
        return this.disabledFn ? this.disabledFn(this.filter.filterFunction) : false;
    }

    handleFilterFnChange = (fn: Fn): void => {
        this.filter.filterFunction = fn;
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
}
