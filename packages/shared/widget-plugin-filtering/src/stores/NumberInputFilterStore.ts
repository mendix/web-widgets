import { Big } from "big.js";
import { ListAttributeValue } from "mendix";
import { action, makeObservable, comparer, trace } from "mobx";
import { NumberArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../typings/FilterFunctions";
import { Number_InputFilterInterface } from "../typings/InputFilterInterface";
import { FilterData, InputData } from "../typings/settings";

export class NumberInputFilterStore
    extends BaseInputFilterStore<NumberArgument, FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary>
    implements Number_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "number";

    constructor(attributes: Array<ListAttributeValue<Big>>) {
        const { formatter } = attributes[0];
        super(new NumberArgument(formatter), new NumberArgument(formatter), "equal", attributes);
        makeObservable(this, {
            updateProps: action
        });

        trace(this, "condition");
        // todo restore operation and value from config
    }

    updateProps(attributes: ListAttributeValue[]): void {
        if (!comparer.shallow(this._attributes, attributes)) {
            this._attributes = attributes;
        }
        const formatter = attributes.at(0)?.formatter;
        // Just pleasing TypeScript.
        if (formatter?.type !== "number") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter);
        this.arg2.updateProps(formatter);
    }

    toJSON(): InputData {
        return [
            this.filterFunction,
            this.arg1.value ? this.arg1.value.toJSON() : null,
            this.arg2.value ? this.arg2.value.toJSON() : null
        ];
    }

    fromJSON(data: FilterData): void {
        if (!Array.isArray(data)) {
            return;
        }
        const [fn, val1, val2] = data;
        this.filterFunction = fn as typeof this.filterFunction;
        try {
            this.arg1.value = new Big(val1 ?? "");
        } catch {
            this.arg1.value = undefined;
        }
        try {
            this.arg2.value = new Big(val2 ?? "");
        } catch {
            this.arg2.value = undefined;
        }
    }
}
