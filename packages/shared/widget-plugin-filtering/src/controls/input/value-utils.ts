import Big from "big.js";
import { Optional, ValueHelper } from "./typings";

export const BigHelper: ValueHelper<Optional<Big>> = {
    fromString: arg => {
        try {
            return new Big(arg);
        } catch {
            return undefined;
        }
    },
    toString: arg => (arg ? arg.toString() : ""),
    equals: (a, b) => (a instanceof Big && b instanceof Big ? a.eq(b) : a === b)
};

export const StringHelper: ValueHelper<Optional<string>> = {
    fromString: arg => arg,
    toString: arg => arg ?? "",
    equals: (a, b) => a === b
};
