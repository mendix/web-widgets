import { useRef } from "react";
import { Big } from "big.js";
import { EditableValue, DynamicValue } from "mendix";

export function useNumber(prop: Big | EditableValue<Big> | DynamicValue<Big> | undefined): Result {
    const result = useRef<Result>();

    if (result.current?.loading === false) {
        return result.current;
    }

    return (result.current = reduce(prop));
}

type Result<T = number | undefined> =
    | {
          loading: true;
      }
    | {
          loading: false;
          value: T;
      };

function reduce(prop: Big | EditableValue<Big> | DynamicValue<Big> | undefined): Result {
    if (prop instanceof Big) {
        return { loading: false, value: prop.toNumber() };
    }

    if (prop === undefined || prop.status === "unavailable") {
        return { loading: false, value: undefined };
    }

    if (prop.value && prop.status === "available") {
        return { loading: false, value: prop.value.toNumber() };
    }

    return { loading: true };
}
