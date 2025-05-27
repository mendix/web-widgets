import { makeObservable, observable, action } from "mobx";

export class InputStore {
    value: string;
    isValid = true;

    constructor(init = "") {
        this.value = init;

        makeObservable(this, {
            value: observable,
            isValid: observable,
            setValue: action,
            onChange: action
        });
    }

    setValue(value: string): void {
        this.value = value;
    }

    setIsValid(value: boolean): void {
        this.isValid = value;
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setValue(event.target.value);
    };
}
