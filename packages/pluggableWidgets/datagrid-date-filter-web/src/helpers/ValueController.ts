import { runInAction } from "mobx";
import { SetFilterValueArgs } from "@mendix/widget-plugin-external-events/typings";
import { Date_InputFilterInterface } from "@mendix/widget-plugin-filtering";

export class ValueController {
    private store: Date_InputFilterInterface;

    constructor(store: Date_InputFilterInterface) {
        this.store = store;
    }

    handleReset = (useDefaults: boolean): void => {
        if (useDefaults) {
            this.store.reset();
        } else {
            this.store.clear();
        }
    };

    handleSetValue = (useDefaults: boolean, valueOptions: SetFilterValueArgs): void => {
        if (useDefaults) {
            this.store.reset();
        } else {
            runInAction(() => {
                this.store.setFilterFn(valueOptions.operators as Date_InputFilterInterface["filterFunction"]);
                this.store.arg1.value = valueOptions.dateTimeValue;
                this.store.arg2.value = valueOptions.dateTimeValue2;
            });
        }
    };
}
