import { Big } from "big.js";

type ArgumentTypes = {
    number: Big;
    date: Date;
    string: string;
};

interface BaseArgumentInterface<T extends keyof ArgumentTypes> {
    type: T;
    value: ArgumentTypes[T] | undefined;
    displayValue: string;
    isValid: boolean;
}

export type StringArgumentInterface = BaseArgumentInterface<"string">;
export type NumberArgumentInterface = BaseArgumentInterface<"number">;
export type DateArgumentInterface = BaseArgumentInterface<"date">;

export type ArgumentInterface = StringArgumentInterface | NumberArgumentInterface | DateArgumentInterface;
