import { DateTimeFormatter, ListAttributeValue } from "mendix";
import { AndCondition, FilterCondition, LiteralExpression } from "mendix/filters";
import {
    and,
    attribute,
    dayEquals,
    dayGreaterThan,
    dayGreaterThanOrEqual,
    dayLessThan,
    dayLessThanOrEqual,
    dayNotEqual,
    equals,
    literal,
    notEqual,
    or
} from "mendix/filters/builders";
import { action, comparer, IReactionDisposer, makeObservable, observable, reaction } from "mobx";
import { betweenToState, isAnd, isEmptyExp, isNotEmptyExp, isOr, singularToState } from "../../condition-utils";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../../typings/FilterFunctions";
import { Date_InputFilterInterface } from "../../typings/InputFilterInterface";
import { FilterFunction } from "../../typings/mendix";
import { FilterData, InputData } from "../../typings/settings";
import { DateArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";

type DateFns = FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;
type StateTuple = [DateFns, Date | undefined, Date | undefined];
type InitState = [DateFns, Date | undefined, Date | undefined] | [DateFns, Date | undefined];

export class DateInputFilterStore
    extends BaseInputFilterStore<DateArgument, DateFns>
    implements Date_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "date";
    private readonly rangeMarkerTag = "__RANGE_MARKER__";
    private computedState: StateTuple;

    constructor(attributes: Array<ListAttributeValue<Date>>, initCond: FilterCondition | null) {
        const { formatter } = attributes[0];
        super(new DateArgument(formatter), new DateArgument(formatter), "equal", attributes);
        // NOTE: some fields already become observable in `super`.
        makeObservable<this, "computedState">(this, {
            updateProps: action,
            computedState: observable.shallow,
            fromViewState: action,
            fromJSON: action
        });
        if (initCond) {
            this.fromViewState(initCond);
        }
        // NOTE: computedState init and setupComputedValues should go after
        // any state initialization (eg. fromViewState).
        this.computedState = [this.filterFunction, this.arg1.value, this.arg2.value];
        this.setupComputeValues();
    }

    get condition(): FilterCondition | undefined {
        const conditions = this._attributes.flatMap(attr => this.getCondition(attr, ...this.computedState));
        switch (conditions.length) {
            case 0:
                return undefined;
            case 1:
                return conditions[0];
            default:
                return or(...conditions);
        }
    }

    setup(): () => void {
        const disposers: Array<() => void> = [];
        disposers.push(this.setupComputeValues());
        return () => disposers.forEach(unsub => unsub());
    }

    updateProps(attributes: ListAttributeValue[]): void {
        if (!comparer.shallow(this._attributes, attributes)) {
            this._attributes = attributes;
            const formatter = attributes.at(0)?.formatter;
            this.arg1.updateProps(formatter as DateTimeFormatter);
            this.arg2.updateProps(formatter as DateTimeFormatter);
        }
    }

    private setupComputeValues(): IReactionDisposer {
        return reaction(
            (): StateTuple => [this.filterFunction, this.arg1.value, this.arg2.value],
            computedState => {
                const [fn, v1, v2] = computedState;
                // Skip changes if value is a half range.
                if (fn === "between" && v1 instanceof Date && v2 === undefined) {
                    return;
                }
                this.computedState = computedState;
            },
            { equals: comparer.shallow }
        );
    }

    private isRange(value: unknown): value is [Date, Date] {
        const [a, b] = Array.isArray(value) ? value : [];
        return a instanceof Date && b instanceof Date;
    }

    private getCondition(
        attr: ListAttributeValue,
        filterFn: DateFns,
        v1: Date | undefined,
        v2: Date | undefined
    ): [FilterCondition] | [] {
        if (!attr.filterable) {
            return [];
        }

        if (filterFn === "between") {
            const values = [v1, v2];
            return this.isRange(values) ? this.getRangeCondition(attr, values) : [];
        }

        return this.getAttrCondition(attr, filterFn, v1);
    }

    private getAttrCondition(
        attr: ListAttributeValue,
        filterFn: Exclude<DateFns, "between">,
        date: Date | undefined
    ): [FilterCondition] | [] {
        const [attrExp, value] = [attribute(attr.id), literal(date)];
        if (filterFn === "empty") {
            return [equals(attrExp, literal(undefined))];
        }
        if (filterFn === "notEmpty") {
            return [notEqual(attrExp, literal(undefined))];
        }
        if (date === undefined) {
            return [];
        }
        switch (filterFn) {
            case "greater":
                return [dayGreaterThan(attrExp, value)];
            case "greaterEqual":
                return [dayGreaterThanOrEqual(attrExp, value)];
            case "equal":
                return [dayEquals(attrExp, value)];
            case "notEqual":
                return [dayNotEqual(attrExp, value)];
            case "smaller":
                return [dayLessThan(attrExp, value)];
            case "smallerEqual":
                return [dayLessThanOrEqual(attrExp, value)];
            default:
                return [];
        }
    }

    private getRangeCondition(attr: ListAttributeValue, [start, end]: [Date, Date]): [FilterCondition] | [] {
        const attrExp = attribute(attr.id);

        return [
            and(
                dayGreaterThanOrEqual(attrExp, literal(start)),
                dayLessThan(attrExp, literal(addDay(end))),
                this.getRangeCondMarker()
            )
        ];
    }

    private rangeExpToState(cond: AndCondition): InitState | null {
        const val = (exp: LiteralExpression): Date | undefined =>
            exp.valueType === "DateTime" ? exp.value : undefined;
        const state = betweenToState(cond, (): DateFns => "between", val);
        if (state === null) {
            return null;
        }
        const [fn, start, end] = state;
        // Restore end date received from picker
        return [fn, start, end ? subDay(end) : undefined];
    }

    private getRangeCondMarker(): FilterCondition {
        return equals(literal(this.rangeMarkerTag), literal(this.rangeMarkerTag));
    }

    private isRangeMarker(cond: FilterCondition | undefined): boolean {
        if (!cond) {
            return false;
        }
        return (
            cond.type === "function" &&
            cond.name === "=" &&
            cond.arg1.type === "literal" &&
            cond.arg2.type === "literal" &&
            cond.arg1.value === this.rangeMarkerTag &&
            cond.arg2.value === this.rangeMarkerTag
        );
    }

    toJSON(): InputData | undefined {
        if (!this.isInitialized) {
            return undefined;
        }
        return [
            this.filterFunction,
            this.arg1.value ? this.arg1.value.toJSON() : null,
            this.arg2.value ? this.arg2.value.toJSON() : null
        ];
    }

    fromJSON(data: FilterData): void {
        const inputData = this.unpackJsonData(data);
        if (!inputData) {
            return;
        }

        const [fn, date1, date2] = inputData;
        this.filterFunction = fn;
        this.arg1.value = parseDateValue(date1);
        this.arg2.value = parseDateValue(date2);
        this.isInitialized = true;
    }

    fromViewState(cond: FilterCondition): void {
        const val = (exp: LiteralExpression): Date | undefined =>
            exp.valueType === "DateTime" ? exp.value : undefined;

        const read = (cond: FilterCondition): InitState | null => {
            // If store has multiple-attrs, unpack expression
            if (isOr(cond)) {
                cond = cond.args[0];
            }
            if (isEmptyExp(cond)) {
                return ["empty", undefined, undefined];
            }
            if (isNotEmptyExp(cond)) {
                return ["notEmpty", undefined, undefined];
            }
            // Restore from "between" expression
            if (isAnd(cond) && this.isRangeMarker(cond.args.at(2))) {
                return this.rangeExpToState(cond);
            }

            return singularToState(cond, this.mapFn, val);
        };

        const initState = read(cond);

        if (initState) {
            this.setState(initState);
            this.isInitialized = true;
        }
    }

    private mapFn = (name: FilterFunction | "between" | "empty" | "notEmpty"): DateFns => {
        switch (name) {
            case "day:=":
                return "equal";
            case "day:!=":
                return "notEqual";
            case "day:<":
                return "smaller";
            case "day:<=":
                return "smallerEqual";
            case "day:>":
                return "greater";
            case "day:>=":
                return "greaterEqual";
            default:
                return "equal";
        }
    };
}

function parseDateValue(value: string | null): Date | undefined {
    if (value === null) {
        return undefined;
    }

    const date = new Date(value);

    return date.toString() === "Invalid Date" ? undefined : date;
}

/**
 * Adds 1 day and returns a new date
 * @param date
 */
function addDay(date: Date): Date {
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(newDate.getUTCDate() + 1);
    return newDate;
}
/**
 * Subtracts 1 day and returns a new date
 * @param date
 */
function subDay(date: Date): Date {
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(newDate.getUTCDate() - 1);
    return newDate;
}
