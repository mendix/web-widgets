import { Argument, DateArgument, NumberArgument, StringArgument } from "../../helpers/filterStores/Argument";
import { FilterCondition } from "mendix/filters";
import {
    AllFunctions,
    FilterFunctionBinary,
    FilterFunctionGeneric,
    FilterFunctionNonValue,
    FilterFunctionString
} from "./FilterFunctions";

interface InputFilterBaseInterface<V extends Argument, OP extends AllFunctions> {
    controlType: "input";
    filterFunction: OP;

    arg1: V;
    arg2: V;

    filterCondition: FilterCondition;

    reset(): void;
}

export type String_InputFilterInterface = InputFilterBaseInterface<
    StringArgument,
    FilterFunctionString | FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary
>;

export type Number_InputFilterInterface = InputFilterBaseInterface<
    NumberArgument,
    FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary
>;

export type Date_InputFilterInterface = InputFilterBaseInterface<
    DateArgument,
    FilterFunctionGeneric | FilterFunctionNonValue | FilterFunctionBinary
>;

export type InputFilterInterface =
    | String_InputFilterInterface
    | Number_InputFilterInterface
    | Date_InputFilterInterface;
