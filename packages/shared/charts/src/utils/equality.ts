import { ListActionValue } from "mendix";
import { flatEqual, defaultEqual } from "@mendix/widget-plugin-platform/utils/flatEqual";

interface TraceProps {
    staticOnClickAction?: ListActionValue;
    dynamicOnClickAction?: ListActionValue;
}

interface ContainerProps {
    series: TraceProps[];
}

export function traceEqual(a: TraceProps, b: TraceProps): boolean {
    return flatEqual(a, b, (prop1, prop2, key) => {
        if (key === "staticOnClickAction" || key === "dynamicOnClickAction") {
            return true;
        }

        return defaultEqual(prop1, prop2);
    });
}

export function containerPropsEqual(prev: ContainerProps, next: ContainerProps): boolean {
    return flatEqual(prev, next, (prop1, prop2, key) => {
        return key === "series" ? flatEqual(prop1, prop2, traceEqual) : defaultEqual(prop1, prop2);
    });
}
