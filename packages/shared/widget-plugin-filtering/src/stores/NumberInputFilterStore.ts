import { Big } from "big.js";
import { ListAttributeValue } from "mendix";
import { action, makeObservable, comparer } from "mobx";
import { NumberArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../typings/FilterFunctions";
import { Number_InputFilterInterface } from "../typings/InputFilterInterface";

export class NumberInputFilterStore
    extends BaseInputFilterStore<
        NumberArgument,
        FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        Big
    >
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
}
