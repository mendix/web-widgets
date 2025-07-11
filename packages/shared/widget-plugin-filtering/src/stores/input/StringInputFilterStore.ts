import { inputStateFromCond } from "@mendix/filter-commons/condition-utils";
import {
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "@mendix/filter-commons/typings/FilterFunctions";
import { FilterData, InputData } from "@mendix/filter-commons/typings/settings";
import { AttributeMetaData, ListAttributeValue, SimpleFormatter } from "mendix";
import { FilterCondition } from "mendix/filters";
import { action, comparer, makeObservable } from "mobx";
import { String_InputFilterInterface } from "../../typings/InputFilterInterface";
import { StringArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { baseNames } from "./fn-mappers";

type StrFns = FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;
type AttrMeta = AttributeMetaData<string> & { formatter?: SimpleFormatter<string> };

export class StringInputFilterStore
    extends BaseInputFilterStore<StringArgument, StrFns>
    implements String_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "string";

    constructor(attributes: AttrMeta[], initCond: FilterCondition | null) {
        const formatter = getFormatter<string>(attributes[0]);
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
        this.setState([fn, s1 ?? undefined, s2 ?? undefined]);
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

function getFormatter<T>(attr: { formatter?: SimpleFormatter<T> }): SimpleFormatter<T> {
    return (
        attr.formatter ??
        ({
            format: v => v ?? "",
            parse: v => ({ valid: true, value: v ?? "" })
        } as SimpleFormatter<T>)
    );
}
