import { ListAttributeValue } from "mendix";
import { action, makeObservable, comparer } from "mobx";
import { StringArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { String_InputFilterInterface } from "./main";
import {
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "../typings/FilterFunctions";

export class StringInputFilterStore
    extends BaseInputFilterStore<
        StringArgument,
        FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary,
        string
    >
    implements String_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "string";

    constructor(attributes: Array<ListAttributeValue<string>>) {
        const { formatter } = attributes[0];
        super(new StringArgument(formatter), new StringArgument(formatter), "equal", attributes);
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
        if (!formatter || formatter.type === "number" || formatter.type === "datetime") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter as ListAttributeValue<string>["formatter"]);
        this.arg2.updateProps(formatter as ListAttributeValue<string>["formatter"]);
    }
}
