import {
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue
} from "@mendix/filter-commons/typings/FilterFunctions";
import { FilterName } from "@mendix/filter-commons/typings/mendix";

export function baseNames(
    fn: FilterName | "between" | "empty" | "notEmpty"
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
