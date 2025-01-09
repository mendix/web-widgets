import { action, autorun, makeAutoObservable, runInAction } from "mobx";

export class SearchStore {
    private delay: number;
    readonly disposers = [] as Array<() => void>;
    readonly defaultValue: string;
    value: string;
    buffer: string;

    constructor({ defaultValue = "", delay = 0 }: { defaultValue?: string; delay?: number } = {}) {
        this.defaultValue = defaultValue;
        this.buffer = this.value = this.defaultValue;
        this.delay = delay;

        makeAutoObservable(this, {
            setBuffer: action,
            clear: action,
            reset: action
        });
    }

    setBuffer(value: string): void {
        this.buffer = value;
    }

    reset(): void {
        this.buffer = this.value = this.defaultValue;
    }

    clear(): void {
        this.buffer = this.value = "";
    }

    setup(): () => void {
        this.disposers.push(
            autorun(
                () => {
                    const value = this.buffer;
                    runInAction(() => (this.value = value));
                },
                { delay: this.delay }
            )
        );
        return () => this.disposers.forEach(dispose => dispose());
    }
}
