import { makeAutoObservable } from "mobx";

export class SelectAllProgressStore {
    selecting = false;
    lengthComputable = false;
    loaded = 0;
    total = 0;
    cancelled = false;

    constructor() {
        makeAutoObservable(this);
    }

    onloadstart = (total: number): void => {
        this.selecting = true;
        this.lengthComputable = true;
        this.total = total;
        this.loaded = 0;
        this.cancelled = false;
    };

    onprogress = (loaded: number): void => {
        this.loaded = loaded;
    };

    onloadend = (): void => {
        this.selecting = false;
        this.lengthComputable = false;
        this.loaded = 0;
        this.total = 0;
        this.cancelled = false;
    };

    oncancel = (): void => {
        this.cancelled = true;
        this.onloadend();
    };

    get progress(): number {
        return this.total > 0 ? (this.loaded / this.total) * 100 : 0;
    }

    get displayProgress(): string {
        if (!this.selecting) return "";
        return `${this.loaded} of ${this.total}`;
    }
}
