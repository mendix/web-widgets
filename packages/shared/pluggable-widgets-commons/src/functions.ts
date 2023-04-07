import { useState } from "react";
import { ActionValue, DynamicValue, EditableValue, ValueStatus } from "mendix";

export const executeAction = (action?: ActionValue): void => {
    if (action && action.canExecute && !action.isExecuting) {
        action.execute();
    }
};

export const isAvailable = (property: DynamicValue<any> | EditableValue<any>): boolean => {
    return property && property.status === ValueStatus.Available && property.value;
};

export const parseStyle = (style = ""): { [key: string]: string } => {
    try {
        return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
            const pair = line.split(":");
            if (pair.length === 2) {
                const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                styleObject[name] = pair[1].trim();
            }
            return styleObject;
        }, {});
    } catch (_) {
        return {};
    }
};

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number): F => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };

    return debounced as F;
};

export function useId(name?: string): string {
    const [id] = useState(() => {
        const num = Math.random().toFixed(9).slice(2);
        return name ? `${name}-${num}` : num;
    });

    return id;
}

function createInspect(id?: string): (props: any) => void {
    let prevProps: any = {};
    return (currentProps: any) => {
        console.log(`[DEBUG]`);
        console.log(`[DEBUG] Render`, id);
        const keys = new Set([...Object.keys(prevProps), ...Object.keys(currentProps)]);
        const changed = Array.from(keys).some(k => {
            const notEq = prevProps[k] !== currentProps[k];
            if (notEq) {
                console.log(`[DEBUG]   > prop [${k}] changed`);
            }
            return notEq;
        });
        if (!changed) {
            console.log("[DEBUG] No prop changes", id);
        }
        prevProps = currentProps;
    };
}

export function usePropInspect(id?: string): (props: any) => void {
    const [inspect] = useState(() => createInspect(id));
    return inspect;
}

function createLog(id: string): (msg: string) => void {
    return (msg: string) => console.log(`[DEBUG]   >`, msg, id);
}

export function useLog(id: string): (msg: string) => void {
    const [log] = useState(() => createLog(id));
    return log;
}
