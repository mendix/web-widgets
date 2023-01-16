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
