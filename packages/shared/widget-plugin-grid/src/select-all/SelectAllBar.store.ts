import { makeAutoObservable } from "mobx";
import { BarStore } from "./select-all.model";

export class SelectAllBarStore implements BarStore {
    pending = false;
    visible = false;
    clearBtnVisible = false;

    constructor() {
        makeAutoObservable(this);
    }

    setClearBtnVisible(value: boolean): void {
        this.clearBtnVisible = value;
    }

    setPending(value: boolean): void {
        this.pending = value;
    }

    hideBar(): void {
        this.visible = false;
        this.clearBtnVisible = false;
    }

    showBar(): void {
        this.visible = true;
    }
}
