import { EditableValue } from "mendix";
import { useEffect, useState } from "react";

interface UseOnLoadTimerProps {
    canExecute: boolean;
    execute?: () => void;
    delay: number | undefined;
    interval: number | undefined;
    repeat: boolean;
    attribute?: EditableValue;
}

class TimerExecutor {
    private intervalHandle: ReturnType<typeof setTimeout> | undefined;
    private isFirstTime: boolean = true;
    private isPendingExecution: boolean = false;
    private canExecute: boolean = false;

    private delay?: number;
    private interval?: number;
    private repeat?: boolean;

    private callback?: () => void;

    setCallback(callback: () => void, canExecute: boolean): void {
        this.callback = callback;
        this.canExecute = canExecute;

        this.trigger();
    }

    setParams(delay: number | undefined, interval: number | undefined, repeat: boolean): void {
        this.delay = delay;
        this.interval = interval;
        this.repeat = repeat;

        this.next();
    }

    get isReady(): boolean {
        return this.delay !== undefined && (!this.repeat || this.interval !== undefined);
    }

    next(): void {
        if (!this.isReady) {
            return;
        }

        if (!this.isFirstTime && !this.repeat) {
            // we did execute it once, and we don't need to repeat
            // so do nothing
            return;
        }

        // schedule a timer
        this.intervalHandle = setTimeout(
            () => {
                this.isPendingExecution = true;
                this.trigger();
                this.isFirstTime = false;
                this.next();
            },
            this.isFirstTime ? this.delay : this.interval
        );
    }

    trigger(): void {
        if (this.isPendingExecution && this.canExecute) {
            this.isPendingExecution = false;
            this.callback?.();
        }
    }

    stop(): void {
        clearTimeout(this.intervalHandle);
        this.intervalHandle = undefined;
        this.delay = undefined;
        this.interval = undefined;
        this.repeat = false;
    }
}

export function useOnLoadTimer(props: UseOnLoadTimerProps): void {
    const { canExecute, execute, delay, interval, repeat, attribute } = props;

    const [timerExecutor] = useState(() => new TimerExecutor());

    // update callback props
    useEffect(() => {
        timerExecutor.setCallback(() => execute?.call(attribute), canExecute);
    }, [timerExecutor, execute, attribute, canExecute]);

    // update interval props
    useEffect(() => {
        timerExecutor.setParams(delay, interval, repeat);
        return () => {
            timerExecutor.stop();
        };
    }, [timerExecutor, delay, interval, repeat]);

    // cleanup
    useEffect(() => {
        return () => {
            timerExecutor.stop();
        };
    }, [timerExecutor]);
}
