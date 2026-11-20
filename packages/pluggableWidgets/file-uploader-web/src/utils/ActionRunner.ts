import { ActionValue } from "mendix";

/** Returns the current value of the action. Called on start and on every `update()`. */
export type ActionGetter = () => ActionValue | undefined;

type Pending = {
    started: boolean;
    getAction: ActionGetter;
    timer: ReturnType<typeof setTimeout>;
    resolve: () => void;
    reject: (e: Error) => void;
};

/**
 * Runs an action and resolves when it has finished.
 *
 * `ActionValue.execute()` returns nothing. Progress is reported through `isExecuting` on new props,
 * so `update()` must be called on every props update. The runner reads the current value of the action
 * through the getter passed to `run()`. This works for plain actions and for linked actions
 * (`ListActionValue.get(item)`), whose value per item also changes on every props update.
 * The action is done once it was seen executing and is no longer executing.
 */
export class ActionRunner {
    private pending?: Pending;

    constructor(private readonly timeoutInSeconds: number) {}

    get isRunning(): boolean {
        return !!this.pending;
    }

    run(getAction: ActionGetter): Promise<void> {
        if (this.pending) {
            return Promise.reject(new Error("The action is already running."));
        }
        const action = getAction();
        if (!action || !action.canExecute) {
            return Promise.reject(new Error("The action can't be executed."));
        }

        return new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending = undefined;
                reject(new Error(`The action did not finish within ${this.timeoutInSeconds} seconds.`));
            }, this.timeoutInSeconds * 1000);

            this.pending = { started: false, getAction, timer, resolve, reject };
            action.execute();
        });
    }

    update(): void {
        const pending = this.pending;
        if (!pending) {
            return;
        }
        const action = pending.getAction();
        if (!action) {
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
