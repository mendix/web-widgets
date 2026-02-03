type TimerState = "initial" | "idle" | "scheduled" | "pending" | "invoking" | "executing" | "completed";

export class TimerExecutor {
    private state: TimerState = "initial";
    private intervalHandle: ReturnType<typeof setTimeout> | undefined;
    private canExecute: boolean = false;

    private delay?: number;
    private interval?: number;
    private repeat?: boolean;

    private callback?: () => void;

    setCallback(callback: () => void, newCanExecute: boolean): void {
        this.callback = callback;
        const prevCanExecute = this.canExecute;
        this.canExecute = newCanExecute;

        if (this.state === "invoking") {
            if (prevCanExecute && !newCanExecute) {
                // Action just started executing (canExecute went from true to false)
                this.onExecutionStart();
                return;
            }
        }

        if (this.state === "executing") {
            if (!prevCanExecute && newCanExecute) {
                // Action completed successfully (canExecute went from false to true)
                this.onExecutionFinish();
                return;
            }
        }

        this.tryExecute();
    }

    setParams(delay: number | undefined, interval: number | undefined, repeat: boolean): void {
        this.delay = delay;
        this.interval = interval;
        this.repeat = repeat;

        if (this.state === "initial") {
            this.scheduleNext();
        }
    }

    get isReady(): boolean {
        return this.delay !== undefined && (!this.repeat || this.interval !== undefined);
    }

    stop(): void {
        clearTimeout(this.intervalHandle);
        this.intervalHandle = undefined;
        this.delay = undefined;
        this.interval = undefined;
        this.repeat = false;
        this.state = "initial";
    }

    private scheduleNext(): void {
        if (!this.isReady || this.state === "executing" || this.state === "completed") {
            return;
        }

        const isFirstTime = this.state === "initial";
        const timeout = isFirstTime ? this.delay : this.interval;

        this.state = "scheduled";
        this.intervalHandle = setTimeout(() => {
            this.onTimerFired();
        }, timeout);
    }

    private onTimerFired(): void {
        this.state = "pending";
        this.tryExecute();
    }

    private tryExecute(): void {
        if (this.state === "pending" && this.canExecute && this.callback) {
            this.state = "invoking";
            this.callback();
        }
    }

    private onExecutionStart(): void {
        this.state = "executing";
    }

    private onExecutionFinish(): void {
        if (this.repeat) {
            this.state = "idle";
            this.scheduleNext();
        } else {
            this.state = "completed";
        }
    }
}
