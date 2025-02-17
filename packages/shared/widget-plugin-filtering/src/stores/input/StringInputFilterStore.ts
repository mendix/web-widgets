import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { action, comparer, makeObservable } from "mobx";
import { inputStateFromCond } from "../../condition-utils";
import {
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "../../typings/FilterFunctions";
import { String_InputFilterInterface } from "../../typings/InputFilterInterface";
import { FilterData, InputData } from "../../typings/settings";
import { StringArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { baseNames } from "./fn-mappers";

type StrFns = FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;
export class StringInputFilterStore
    extends BaseInputFilterStore<StringArgument, StrFns>
    implements String_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "string";

    constructor(attributes: Array<ListAttributeValue<string>>, initCond: FilterCondition | null) {
        const { formatter } = attributes[0];
        super(new StringArgument(formatter), new StringArgument(formatter), "equal", attributes);
        makeObservable(this, {
            updateProps: action,
            fromJSON: action,
            fromViewState: action
        });
        if (initCond) {
            this.fromViewState(initCond);
        }
    }

    updateProps(attributes: ListAttributeValue[]): void {
        if (!comparer.shallow(this._attributes, attributes)) {
            this._attributes = attributes;
        }
        const formatter = attributes.at(0)?.formatter;
        this.arg1.updateProps(formatter as ListAttributeValue<string>["formatter"]);
        this.arg2.updateProps(formatter as ListAttributeValue<string>["formatter"]);
    }

    toJSON(): InputData | undefined {
        if (!this.isInitialized) {
            return undefined;
        }

        return [this.filterFunction, this.arg1.value ?? null, this.arg2.value ?? null];
    }

    fromJSON(data: FilterData): void {
        const inputData = this.unpackJsonData(data);
        if (!inputData) {
            return;
        }
        const [fn, s1, s2] = inputData;
        this.filterFunction = fn;
        this.arg1.value = s1 ? s1 : undefined;
        this.arg2.value = s2 ? s2 : undefined;
        this.isInitialized = true;
    }

    fromViewState(cond: FilterCondition): void {
        const initState = inputStateFromCond(
            cond,
            (fn): StrFns => {
                if (fn === "contains") {
                    return "contains";
                }

                if (fn === "starts-with") {
                    return "startsWith";
                }

                if (fn === "ends-with") {
                    return "endsWith";
                }

                return baseNames(fn);
            },
            exp => (exp.valueType === "string" ? exp.value : undefined)
        );

        if (!initState) {
            return;
        }

        this.setState(initState);
        this.isInitialized = true;
    }
}
