import { makeAutoObservable, reaction } from "mobx";

export class SearchStore {
    readonly disposers = [] as Array<() => void>;
    readonly defaultValue: string;
    value: string;
    buffer: string;

    constructor({ defaultValue = "" }: { defaultValue?: string } = {}) {
        this.defaultValue = defaultValue;
        this.buffer = this.value = this.defaultValue;

        makeAutoObservable(this);
        this.disposers.push(
            reaction(
                () => this.buffer.trim(),
                value => (this.value = value),
                { delay: 300 }
            )
        );
    }

    setValue(value: string): void {
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
