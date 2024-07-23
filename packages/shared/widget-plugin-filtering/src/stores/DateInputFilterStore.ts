// import { isDate } from "date-fns/isDate";
import { addDays } from "date-fns/addDays";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
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
import { action, makeObservable, reaction, observable, comparer } from "mobx";
import { DateArgument } from "./Argument";
import { BaseInputFilterStore } from "./BaseInputFilterStore";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../typings/FilterFunctions";
import { Date_InputFilterInterface } from "../typings/InputFilterInterface";

type FilterFn = FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary;
type StateTuple = [FilterFn, [Date | undefined, Date | undefined]];
export class DateInputFilterStore
    extends BaseInputFilterStore<DateArgument, FilterFn>
    implements Date_InputFilterInterface
{
    readonly storeType = "input";
    readonly type = "date";
    private disposers: Array<() => void> = [];
    private computedState: StateTuple;

    constructor(attributes: Array<ListAttributeValue<Date>>) {
        const { formatter } = attributes[0];
        super(new DateArgument(formatter), new DateArgument(formatter), "equal", attributes);
        this.computedState = [this.filterFunction, [this.arg1.value, this.arg2.value]];
        makeObservable<this, "computedState">(this, {
            updateProps: action,
            computedState: observable.shallow
        });
        this.setupComputeValues();
        // todo restore operation and value from config
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

    updateProps(attributes: ListAttributeValue[]): void {
        if (!comparer.shallow(this._attributes, attributes)) {
            this._attributes = attributes;
        }
        const formatter = attributes.at(0)?.formatter;
        // Just pleasing TypeScript.
        if (formatter?.type !== "datetime") {
            console.error("InputFilterStore: encounter invalid attribute type while updating props.");
            return;
        }
        this.arg1.updateProps(formatter);
        this.arg2.updateProps(formatter);
    }

    private setupComputeValues(): void {
        const disposer = reaction(
            (): StateTuple => [this.filterFunction, [this.arg1.value, this.arg2.value]],
            computedState => {
                const [fn, values] = computedState;
                // Skip changes if value is a half range.
                if (fn === "between" && values.at(0) instanceof Date && values.at(1) === undefined) {
                    return;
                }
                this.computedState = computedState;
            },
            { equals: comparer.shallow }
        );

        this.disposers.push(disposer);
    }

    dispose(): void {
        this.disposers.forEach(dispose => dispose());
        this.disposers = [];
    }

    private isRange(value: unknown): value is [Date, Date] {
        const [a, b] = Array.isArray(value) ? value : [];
        return a instanceof Date && b instanceof Date;
    }

    private getCondition(
        attr: ListAttributeValue,
        filterFn: FilterFn,
        values: [Date | undefined, Date | undefined]
    ): [FilterCondition] | [] {
        if (!attr.filterable) {
            return [];
        }

        if (filterFn === "between") {
            return this.isRange(values) ? this.getRangeCondition(attr, values) : [];
        }

        const value = values.at(0);
        return value ? this.getAttrCondition(attr, filterFn, value) : [];
    }

    private getAttrCondition(
        attr: ListAttributeValue,
        filterFn: Exclude<FilterFn, "between">,
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
                lessThanOrEqual(attrExp, literal(new Date(addDays(end, 1).getTime() - 1)))
            )
        ];
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
