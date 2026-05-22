import { AttributeMetaData, ListAttributeValue, SimpleFormatter } from "mendix";
import { FilterCondition } from "mendix/filters";
import { attribute, equals, literal, notEqual, and, or } from "mendix/filters/builders";
import { action, comparer, makeObservable } from "mobx";
import { inputStateFromCond, isAnd, isBinary, isOr } from "@mendix/filter-commons/condition-utils";
import {
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "@mendix/filter-commons/typings/FilterFunctions";
import { FilterData, InputData } from "@mendix/filter-commons/typings/settings";
import { StringArgument } from "./Argument";
import { BaseInputFilterStore, EmptyConditionBuilder } from "./BaseInputFilterStore";
import { baseNames } from "./fn-mappers";
import { String_InputFilterInterface } from "../../typings/InputFilterInterface";

type StrFns = FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;
type AttrMeta = AttributeMetaData<string> & { formatter?: SimpleFormatter<string> };

const buildStringEmpty: EmptyConditionBuilder = (listAttribute, operation) => {
    const attrExp = attribute(listAttribute.id);
    if (operation === "empty") {
        return or(equals(attrExp, literal(undefined)), equals(attrExp, literal("")));
    }
    return and(notEqual(attrExp, literal(undefined)), notEqual(attrExp, literal("")));
};

function isUndefinedLiteralEq(exp: FilterCondition, op: "=" | "!="): boolean {
    return isBinary(exp) && exp.name === op && exp.arg2.type === "literal" && exp.arg2.valueType === "undefined";
}

function isEmptyStringLiteralEq(exp: FilterCondition, op: "=" | "!="): boolean {
    if (!isBinary(exp) || exp.name !== op || exp.arg2.type !== "literal") {
        return false;
    }
    // Mendix runtime emits lowercase "string"; the shared test mock emits "String".
    // Accept both so detection works in tests AND in production.
    const vt = exp.arg2.valueType as string;
    return (vt === "string" || vt === "String") && exp.arg2.value === "";
}

// or(equals(_, undef), equals(_, ""))
function isStringEmptyExp(cond: FilterCondition): boolean {
    if (!isOr(cond) || cond.args.length !== 2) {
        return false;
    }
    const [a, b] = cond.args;
    return (
        (isUndefinedLiteralEq(a, "=") && isEmptyStringLiteralEq(b, "=")) ||
        (isUndefinedLiteralEq(b, "=") && isEmptyStringLiteralEq(a, "="))
    );
}

// and(notEqual(_, undef), notEqual(_, ""))
function isStringNotEmptyExp(cond: FilterCondition): boolean {
    if (!isAnd(cond) || cond.args.length !== 2) {
        return false;
    }
    const [a, b] = cond.args;
    return (
        (isUndefinedLiteralEq(a, "!=") && isEmptyStringLiteralEq(b, "!=")) ||
        (isUndefinedLiteralEq(b, "!=") && isEmptyStringLiteralEq(a, "!="))
    );
}

export class StringInputFilterStore
    extends BaseInputFilterStore<StringArgument, StrFns>
    implements String_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "string";

    constructor(attributes: AttrMeta[], initCond: FilterCondition | null) {
        const formatter = getFormatter<string>(attributes[0]);
        super(new StringArgument(formatter), new StringArgument(formatter), "equal", attributes);
        this.buildEmpty = buildStringEmpty;
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
        // Compound empty/notEmpty must be detected BEFORE delegating to inputStateFromCond,
        // otherwise the and(...) shape for notEmpty would fall into betweenToState.
        if (isStringEmptyExp(cond)) {
            this.setState(["empty"]);
            this.isInitialized = true;
            return;
        }
        if (isStringNotEmptyExp(cond)) {
            this.setState(["notEmpty"]);
            this.isInitialized = true;
            return;
        }

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
