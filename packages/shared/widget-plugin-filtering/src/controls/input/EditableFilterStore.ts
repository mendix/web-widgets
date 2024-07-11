import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";
import { autorun, runInAction, reaction } from "mobx";
import { InputFilterInterface } from "../../stores/typings/InputFilterInterface";
import { InputStore } from "./InputStore";

type Params<T> = {
    filter: T;
    changeDelay?: number;
};

export class EditableFilterStore<F extends InputFilterInterface> {
    input1: InputStore;
    input2: InputStore;
    private filter: F;
    private readonly changeDelay;

    constructor(params: Params<F>) {
        const { filter, changeDelay = 500 } = params;
        this.changeDelay = changeDelay;
        this.input1 = new InputStore();
        this.input2 = new InputStore();
        this.filter = filter;
    }

    setup(): () => void {
        const [onInputsChange, clearDebounce] = debounce(([v1, v2]: [string, string]) => {
            runInAction(() => {
                this.filter.arg1.displayValue = v1;
                this.filter.arg2.displayValue = v2;
            });
        }, this.changeDelay);

        // onInputsChange - debounced reaction (effect) for both inputs.
        // Triggered whenever one of the inputs is changed.
        // This reaction writes value to filter.
        const inputChangeDisposer = reaction(() => {
            return [this.input1.value, this.input2.value];
        }, onInputsChange);

        // Autorun to sync filter args with inputs.
        // Runs whenever one of the argument value is changed.
        const filterChangeDisposer = autorun(() => {
            this.input1.setValue(this.filter.arg1.displayValue);
            this.input2.setValue(this.filter.arg2.displayValue);
        });

        const bindings = [clearDebounce, inputChangeDisposer, filterChangeDisposer];

        return () => {
            bindings.forEach(dispose => dispose());
        };
    }

    /** @remark Keep in mind, this method used only to set defaults.  */
    UNSAFE_setDefaults<Fn extends F["filterFunction"], V extends F["arg1"]["value"]>(
        state: [Fn] | [Fn, V] | [Fn, V, V]
    ): void {
        [this.filter.filterFunction, this.filter.arg1.value, this.filter.arg2.value] = state;
    }
}
