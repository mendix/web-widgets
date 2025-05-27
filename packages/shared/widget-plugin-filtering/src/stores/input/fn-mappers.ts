import { FilterFunctionBinary, FilterFunctionGeneric, FilterFunctionNonValue } from "../../typings/FilterFunctions";
import { FilterFunction } from "../../typings/mendix";

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
