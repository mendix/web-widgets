import { ListAttributeValue } from "mendix";
import { action, makeObservable } from "mobx";
import { Date_InputFilterInterface } from "./typings/InputFilterInterface";
import { DateArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "./typings/FilterFunctions";

export class DateInputFilterStore
    extends BaseInputFilterStore<
        DateArgument,
        FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        Date
    >
    implements Date_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "date";

    constructor(attributes: Array<ListAttributeValue<Date>>) {
        const { formatter } = attributes[0];
        super(new DateArgument(formatter), new DateArgument(formatter), "equal", attributes);
        makeObservable(this, {
            updateProps: action
        });
        // todo restore operation and value from config
    }

    updateProps(attributes: ListAttributeValue[]): void {
        this._attributes = attributes;
        const formatter = attributes.at(0)?.formatter;
        // Just pleasing TypeScript.
        if (formatter?.type !== "datetime") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter);
        this.arg2.updateProps(formatter);
    }
}
