import { ActionValue } from "mendix";

type Pending = {
    started: boolean;
    timer: ReturnType<typeof setTimeout>;
    resolve: () => void;
    reject: (e: Error) => void;
};

/**
 * Runs an action and resolves when it has finished.
 *
 * `ActionValue.execute()` returns nothing. Progress is reported through `isExecuting` on new props,
 * so every new value of the action must be passed to `update()`. The action is done once it was seen
 * executing and is no longer executing.
 */
export class ActionRunner {
    private pending?: Pending;

    constructor(private readonly timeoutInSeconds: number) {}

    get isRunning(): boolean {
        return !!this.pending;
    }

    run(action: ActionValue | undefined): Promise<void> {
        if (this.pending) {
            return Promise.reject(new Error("The action is already running."));
        }
        if (!action || !action.canExecute) {
            return Promise.reject(new Error("The action can't be executed."));
        }

        return new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending = undefined;
                reject(new Error(`The action did not finish within ${this.timeoutInSeconds} seconds.`));
            }, this.timeoutInSeconds * 1000);

            this.pending = { started: false, timer, resolve, reject };
            action.execute();
        });
    }

    update(action: ActionValue | undefined): void {
        const pending = this.pending;
        if (!pending || !action) {
            return;
        }

        if (action.isExecuting) {
            pending.started = true;
        } else if (pending.started) {
            clearTimeout(pending.timer);
            this.pending = undefined;
            pending.resolve();
        }
    }

    dispose(): void {
        if (this.pending) {
            clearTimeout(this.pending.timer);
            this.pending = undefined;
        }
    }
}
