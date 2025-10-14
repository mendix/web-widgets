import { EditableValue } from "mendix";
import { useEffect, useState } from "react";
import { debounce } from "@mendix/widget-plugin-platform/utils/debounce";

interface UseAttributeMonitorProps {
    canExecute: boolean;
    execute?: () => void;
    delay: number | undefined;
    attribute?: EditableValue;
}

class AttributeMonitor {
    private currentValue: EditableValue | undefined;
    private canExecute = false;
    private debouncedCallback: [() => void, () => void] | undefined;

    updateCallback(newCb?: () => void, delay?: number): void {
        this.debouncedCallback?.[1](); // cancel previous one
        if (newCb && delay !== undefined) {
            this.debouncedCallback = debounce(newCb, delay);
        }
    }

    updateCanExecute(canExecute: boolean): void {
        this.canExecute = canExecute;
    }

    updateAttribute(newValue?: EditableValue): void {
        if (newValue === undefined || newValue.status === "unavailable") {
            // value is not present at all or not available, do nothing.
            return;
        }

        if (newValue.status === "loading") {
            // value is still loading, wait for it
            return;
        }

        if (this.currentValue === undefined) {
            // this is the first load, as the current value is absent
            // remember the value and wait for next updates
            this.currentValue = newValue;

            return;
        }

        // we got new value, compare it to the current one
        // and execute callback if it changed.
        if (this.currentValue.value !== newValue.value) {
            // todo: execute debounced
            // onEventChange?.execute();
            this.trigger();
        }

        // remember the value for the next time
        this.currentValue = newValue;
    }

    trigger(): void {
        if (this.canExecute) {
            this.debouncedCallback?.[0]();
        }
    }

    stop(): void {
        // drop all pending executions
        this.debouncedCallback?.[1]();
    }
}

export function useAttributeMonitor(props: UseAttributeMonitorProps): void {
    const [attributeMonitor] = useState(() => new AttributeMonitor());

    // update canExecute props
    useEffect(() => {
        attributeMonitor.updateCanExecute(props.canExecute);
    }, [attributeMonitor, props.canExecute]);

    // update callback props
    useEffect(() => {
        attributeMonitor.updateCallback(props.execute, props.delay);
    }, [attributeMonitor, props.execute, props.delay]);

    useEffect(() => {
        attributeMonitor.updateAttribute(props.attribute);
    }, [attributeMonitor, props.attribute]);

    // cleanup
    useEffect(() => {
        return () => {
            attributeMonitor.stop();
        };
    }, [attributeMonitor]);
}
