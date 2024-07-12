import { makeObservable, observable, action } from "mobx";

export class InputStore {
    value: string;

    constructor(init = "") {
        this.value = init;

        makeObservable(this, {
            value: observable,
            setValue: action,
            onChange: action
        });
    }

    setValue(value: string): void {
        this.value = value;
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setValue(event.target.value);
    };
}
