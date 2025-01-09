import { action, autorun, makeAutoObservable, runInAction } from "mobx";

export class SearchStore {
    readonly disposers = [] as Array<() => void>;
    readonly defaultValue: string;
    value: string;
    buffer: string;

    constructor({ defaultValue = "", delay = 0 }: { defaultValue?: string; delay?: number } = {}) {
        this.defaultValue = defaultValue;
        this.buffer = this.value = this.defaultValue;

        makeAutoObservable(this, {
            setBuffer: action,
            clear: action,
            reset: action
        });

        this.disposers.push(
            autorun(
                () => {
                    const value = this.buffer;
                    runInAction(() => (this.value = value));
                },
                { delay }
            )
        );
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

    setup() {
        return () => this.disposers.forEach(dispose => dispose());
    }
}
