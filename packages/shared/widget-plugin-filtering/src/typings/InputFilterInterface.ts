import {
    AllFunctions,
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "./FilterFunctions";
import {
    ArgumentInterface,
    DateArgumentInterface,
    NumberArgumentInterface,
    StringArgumentInterface
} from "./ArgumentInterface";

export interface InputFilterBaseInterface<
    A extends ArgumentInterface,
    Fn extends AllFunctions,
    V = A["value"],
    D = [Fn] | [Fn, V] | [Fn, V, V]
> {
    storeType: "input";
    filterFunction: Fn;
    defaultState: D;

    arg1: A;
    arg2: A;

    reset(): void;
    clear(): void;
    setFilterFn(fn: Fn): void;
    UNSAFE_setDefaults(state: [Fn] | [Fn, V] | [Fn, V, V]): void;
    setup?(): (() => void) | void;
}

export type String_InputFilterInterface = InputFilterBaseInterface<
    StringArgumentInterface,
    FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary
>;

export type Number_InputFilterInterface = InputFilterBaseInterface<
    NumberArgumentInterface,
    FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary
>;

export type Date_InputFilterInterface = InputFilterBaseInterface<
    DateArgumentInterface,
    FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary
>;

export type FilterV<T> = T extends InputFilterBaseInterface<infer A, any> ? A["value"] : never;

export type FilterFn<T> = T extends InputFilterBaseInterface<any, infer Fn> ? Fn : never;

export type InputFilterInterface =
    | String_InputFilterInterface
    | Number_InputFilterInterface
    | Date_InputFilterInterface;
