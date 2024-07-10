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

interface InputFilterBaseInterface<V extends ArgumentInterface, OP extends AllFunctions> {
    storeType: "input";
    filterFunction: OP;

    arg1: V;
    arg2: V;

    reset(): void;
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
