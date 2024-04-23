import { DynamicValue } from "mendix";
import { useRef } from "react";

export function useDefaultValue<T>(defaultValueProp?: DynamicValue<T>): T | undefined | null {
    const defaultValueRef = useRef<T | undefined | null>(null);

    if (defaultValueProp?.status !== "loading" && defaultValueRef.current === null) {
        defaultValueRef.current = defaultValueProp?.value;
    }

    return defaultValueRef.current;
}
