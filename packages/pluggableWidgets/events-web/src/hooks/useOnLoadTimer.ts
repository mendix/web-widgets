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
    private waitingExecutionToFinish: boolean = false;
    private canExecute: boolean = false;

    private delay?: number;
    private interval?: number;
    private repeat?: boolean;

    private callback?: () => void;

    setCallback(callback: () => void, newCanExecute: boolean): void {
        this.callback = callback;

        if (this.waitingExecutionToFinish && this.canExecute && !newCanExecute) {
            // this means we just executed the command, and canExecute went from true to false
            // we should not do anything, only wait for the flag to go back to true
            this.canExecute = newCanExecute;
            return;
        }

        if (this.waitingExecutionToFinish && !this.canExecute && newCanExecute) {
            // this means action completed successfully
            // we can start a new timer
            this.waitingExecutionToFinish = false;
            this.canExecute = newCanExecute;
            this.next();
            return;
        }

        this.canExecute = newCanExecute;
        this.trigger();
    }

    setParams(delay: number | undefined, interval: number | undefined, repeat: boolean): void {
        this.delay = delay;
        this.interval = interval;
        this.repeat = repeat;

        if (this.isFirstTime) {
            // kickstart the timer for the first time
            this.next();
        }
    }

    get isReady(): boolean {
        return this.delay !== undefined && (!this.repeat || this.interval !== undefined);
    }

    next(): void {
        if (!this.isReady || this.waitingExecutionToFinish) {
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
                this.isFirstTime = false;
                this.trigger();
            },
            this.isFirstTime ? this.delay : this.interval
        );
    }

    trigger(): void {
        if (this.isPendingExecution && this.canExecute) {
            this.isPendingExecution = false;
            this.waitingExecutionToFinish = true;
            this.callback?.();
        }
    }

    stop(): void {
        clearTimeout(this.intervalHandle);
        this.intervalHandle = undefined;
        this.delay = undefined;
        this.interval = undefined;
        this.repeat = false;
        this.isFirstTime = true;
        this.isPendingExecution = false;
        this.waitingExecutionToFinish = false;
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
}
