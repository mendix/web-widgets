export type FilterFunctionNonValue = "empty" | "notEmpty";
export type FilterFunctionGeneric = "equal" | "notEqual" | "greater" | "greaterEqual" | "smaller" | "smallerEqual";
export type FilterFunctionBinary = "between"; // | "betweenEqRight" | "betweenEqLeft" | "betweenEqBoth";
export type FilterFunctionString = "contains" | "startsWith" | "endsWith";

export type AllFunctions = FilterFunctionNonValue | FilterFunctionGeneric | FilterFunctionBinary | FilterFunctionString;
