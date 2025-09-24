import { action, makeObservable, observable } from "mobx";
import { ChangeEvent } from "react";

export class InputStore {
    value: string;
    isValid = true;

    constructor(init = "") {
        this.value = init;

        makeObservable(this, {
            value: observable,
            isValid: observable,
            setValue: action,
            setIsValid: action,
            onChange: action
        });
    }

    setValue(value: string): void {
        this.value = value;
    }

    setIsValid(value: boolean): void {
        this.isValid = value;
    }

    onChange = (event: ChangeEvent<HTMLInputElement>): void => {
        this.setValue(event.target.value);
    };
}
