// import { isDate } from "date-fns/isDate";
import { addDays } from "date-fns/addDays";
import { ListAttributeValue } from "mendix";
import { FilterCondition, LiteralExpression } from "mendix/filters";
import {
    and,
    attribute,
    equals,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    literal,
    notEqual,
    or
} from "mendix/filters/builders";
import { action, makeObservable, reaction, observable, comparer, IReactionDisposer } from "mobx";
import { DateArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../typings/FilterFunctions";
import { Date_InputFilterInterface } from "../typings/InputFilterInterface";
import { FilterData, InputData } from "../typings/settings";
import { isAnd, betweenToState, singularToState, isEmptyExp, isNotEmptyExp } from "../condition-utils";
import { baseNames } from "./fn-mappers";

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
            // Just pleasing TypeScript.
            if (formatter?.type !== "datetime") {
                console.error("InputFilterStore: encounter invalid attribute type while updating props.");
                return;
            }
            this.arg1.updateProps(formatter);
            this.arg2.updateProps(formatter);
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

        return v1 ? this.getAttrCondition(attr, filterFn, v1) : [];
    }

    private getAttrCondition(
        attr: ListAttributeValue,
        filterFn: Exclude<DateFns, "between">,
        value: Date
    ): [FilterCondition] | [] {
        value = changeTimeToMidnight(value);
        const attrExp = attribute(attr.id);
        switch (filterFn) {
            case "empty":
                return [equals(attrExp, literal(undefined))];
            case "notEmpty":
                return [notEqual(attrExp, literal(undefined))];
            case "greater":
                // > Day +1 at midnight -1ms
                return [greaterThan(attrExp, literal(new Date(addDays(value, 1).getTime() - 1)))];
            case "greaterEqual":
                // >= day at midnight
                return [greaterThanOrEqual(attrExp, literal(value))];
            case "equal":
                // >= day at midnight and < day +1 midnight
                return [
                    and(greaterThanOrEqual(attrExp, literal(value)), lessThan(attrExp, literal(addDays(value, 1))))
                ];
            case "notEqual":
                // < day at midnight or >= day +1 at midnight
                return [or(lessThan(attrExp, literal(value)), greaterThanOrEqual(attrExp, literal(addDays(value, 1))))];
            case "smaller":
                // < day at midnight
                return [lessThan(attrExp, literal(value))];
            case "smallerEqual":
                // <= day +1 at midnight -1ms
                return [lessThanOrEqual(attrExp, literal(new Date(addDays(value, 1).getTime() - 1)))];
            default:
                return [];
        }
    }

    private getRangeCondition(attr: ListAttributeValue, [start, end]: [Date, Date]): [FilterCondition] | [] {
        [start, end] = [changeTimeToMidnight(start), changeTimeToMidnight(end)];
        const attrExp = attribute(attr.id);

        return [
            and(
                greaterThanOrEqual(attrExp, literal(start)),
                lessThanOrEqual(attrExp, literal(new Date(addDays(end, 1).getTime() - 1))),
                this.getRangeCondMarker()
            )
        ];
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
        const parse = (value: string | null): Date | undefined => {
            if (value === null) {
                return undefined;
            }

            const date = new Date(value);

            return date.toString() === "Invalid Date" ? undefined : date;
        };
        const [fn, date1, date2] = data;
        this.filterFunction = fn as DateFns;
        this.arg1.value = parse(date1);
        this.arg2.value = parse(date2);
        this.isInitialized = true;
    }

    fromViewState(cond: FilterCondition): void {
        const val = (exp: LiteralExpression): Date | undefined =>
            exp.valueType === "DateTime" ? exp.value : undefined;

        const read = (cond: FilterCondition): InitState | null => {
            if (isEmptyExp(cond)) {
                return ["empty", undefined, undefined];
            }
            if (isNotEmptyExp(cond)) {
                return ["notEmpty", undefined, undefined];
            }
            if (isAnd(cond) && this.isRangeMarker(cond.args.at(2))) {
                return betweenToState(cond, (): DateFns => "between", val);
            }
            switch (cond.name) {
                // equal
                case "and":
                    return singularToState(cond.args[0], (): DateFns => "equal", val);
                // notEqual
                case "or":
                    return singularToState(cond.args[0], (): DateFns => "notEqual", val);
                default:
                    return singularToState(cond, baseNames, val);
            }
        };

        const initState = read(cond);

        if (initState) {
            this.setState(initState);
            this.isInitialized = true;
        }
    }
}

/**
 * Change the time of a date and return an UTC date
 * @param date
 * @param hours
 * @param minutes
 * @param seconds
 */
export function changeTimeToMidnight(date: Date): Date {
    const newDate = new Date(date.getTime());
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
}
