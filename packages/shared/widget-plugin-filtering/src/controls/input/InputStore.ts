import { makeAutoObservable } from "mobx";

export class InputStore {
    value: string;

    constructor(init = "") {
        this.value = init;
        makeAutoObservable(this);
    }

    setValue(value: string): void {
        this.value = value;
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setValue(event.target.value);
    };
}
