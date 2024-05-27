import { FilterType } from "@mendix/widget-plugin-filtering";
import { ListAttributeValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { FilterTypeEnum, InitValues } from "../base-types";
import { FilterAPIBox } from "./useFilterAPIv2";
import { changeTimeToMidnight } from "../../utils/date-utils";
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
import { addDays } from "date-fns";

type Value = Date | [Date | null, Date | null] | null;

export class FilterAPIClient {
    #api: FilterAPIBox;

    constructor(api: FilterAPIBox) {
        this.#api = api;
    }

    dispatch(type: FilterTypeEnum, value: Value): void {
        this.#api.current.dispatch({
            getFilterCondition: this.buildCondition.bind(this, type, value, this.#api.current.attributes),
            filterType: FilterType.DATE
        });
    }

    get initValues(): InitValues | undefined {
        return this.#api.current.initValues;
    }

    get parentChannelName(): string | undefined {
        return this.#api.current.parentChannelName;
    }

    private buildCondition(
        type: FilterTypeEnum,
        value: Value,
        attributes: ListAttributeValue[]
    ): FilterCondition | undefined {
        const conditions = attributes.flatMap(attr => this.getAttrCondition(type, value, attr));
        switch (conditions.length) {
            case 0:
                return undefined;
            case 1:
                return conditions[0];
            default:
                return or(...conditions);
        }
    }

    private isRange(value: Value): value is [Date, Date] {
        const [a, b] = Array.isArray(value) ? value : [];
        return a instanceof Date && b instanceof Date;
    }

    private getAttrCondition(type: FilterTypeEnum, value: Value, attr: ListAttributeValue): [FilterCondition] | [] {
        if (!attr.filterable || value === null) {
            return [];
        }

        if (Array.isArray(value)) {
            return this.getRangeCondition(type, value, attr);
        }

        const attrExp = attribute(attr.id);
        const dateValue = changeTimeToMidnight(value);
        switch (type) {
            case "empty":
                return [equals(attrExp, literal(undefined))];
            case "notEmpty":
                return [notEqual(attrExp, literal(undefined))];
            case "greater":
                // > Day +1 at midnight -1ms
                return [greaterThan(attrExp, literal(new Date(addDays(dateValue, 1).getTime() - 1)))];
            case "greaterEqual":
                // >= day at midnight
                return [greaterThanOrEqual(attrExp, literal(dateValue))];
            case "equal":
                // >= day at midnight and < day +1 midnight
                return [
                    and(
                        greaterThanOrEqual(attrExp, literal(dateValue)),
                        lessThan(attrExp, literal(addDays(dateValue, 1)))
                    )
                ];
            case "notEqual":
                // < day at midnight or >= day +1 at midnight
                return [
                    or(
                        lessThan(attrExp, literal(dateValue)),
                        greaterThanOrEqual(attrExp, literal(addDays(dateValue, 1)))
                    )
                ];
            case "smaller":
                // < day at midnight
                return [lessThan(attrExp, literal(dateValue))];
            case "smallerEqual":
                // <= day +1 at midnight -1ms
                return [lessThanOrEqual(attrExp, literal(new Date(addDays(dateValue, 1).getTime() - 1)))];
            default:
                return [];
        }
    }

    private getRangeCondition(type: FilterTypeEnum, value: Value, attr: ListAttributeValue): [FilterCondition] | [] {
        if (type !== "between" || !this.isRange(value)) {
            return [];
        }

        const attrExp = attribute(attr.id);
        let [start, end] = value;
        start = changeTimeToMidnight(start);
        end = changeTimeToMidnight(end);

        return [
            and(
                greaterThanOrEqual(attrExp, literal(start)),
                lessThanOrEqual(attrExp, literal(new Date(addDays(end, 1).getTime() - 1)))
            )
        ];
    }
}
