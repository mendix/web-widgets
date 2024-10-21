import { useRef } from "react";
import Big from "big.js";
import { EditableValue, DynamicValue } from "mendix";

export function useNumber(prop: Big | EditableValue<Big> | DynamicValue<Big> | undefined): Result {
    const isLoaded = (useRef(false).current ||= !loading(prop));

    if (isLoaded) {
        return {
            loading: false,
            // Always use latest value from prop.
            value: value(prop)
        };
    }

    return { loading: true };
}

type Result<T = number | undefined> =
    | {
          loading: true;
      }
    | {
          loading: false;
          value: T;
      };

function value(prop: Big | EditableValue<Big> | DynamicValue<Big> | undefined): number | undefined {
    if (prop instanceof Big) {
        return prop.toNumber();
    }

    if (prop && prop.status === "available" && prop.value) {
        return prop.value.toNumber();
    }

    return undefined;
}

function loading(prop: Big | EditableValue<Big> | DynamicValue<Big> | undefined): boolean {
    if (prop instanceof Big) {
        return false;
    }

    if (prop === undefined) {
        return false;
    }

    return prop.status === "loading";
}
