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

interface InputFilterBaseInterface<A extends ArgumentInterface, Fn extends AllFunctions, S = A["value"]> {
    storeType: "input";
    filterFunction: Fn;

    arg1: A;
    arg2: A;

    reset(): void;
    clear(): void;
    UNSAFE_setDefaults(state: [Fn] | [Fn, S] | [Fn, S, S]): void;
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

export type InputFilterInterface =
    | String_InputFilterInterface
    | Number_InputFilterInterface
    | Date_InputFilterInterface;
