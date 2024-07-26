import { FilterCondition } from "mendix/filters";
import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../typings/FilterFunctions";
type Func<T> = T extends { name: infer Fn } ? Fn : never;
type FilterFunction = Func<FilterCondition>;

export function baseNames(
    fn: FilterFunction | "between" | "empty" | "notEmpty"
): FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary {
    switch (fn) {
        case "=":
            return "equal";
        case "!=":
            return "notEqual";
        case ">":
            return "greater";
        case ">=":
            return "greaterEqual";
        case "<":
            return "smaller";
        case "<=":
            return "smallerEqual";
        case "between":
        case "empty":
        case "notEmpty":
            return fn;
        default:
            return "equal";
    }
}
