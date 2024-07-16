import { makeObservable, observable, action } from "mobx";

export class CalendarStore {
    expanded = false;

    constructor() {
        makeObservable(this, {
            expanded: observable,
            UNSAFE_setExpanded: action
        });
    }

    /**
     * DON'T USE THIS STORE TO CONTROL THE CALENDAR STATE.
     * @remark
     * Do not use this store to control calendar state in react-datepicker.
     * This store exists only to synchronize the aria-expanded attribute on the button.
     * react-datepicker doesn't support controlled mode. So, if you think
     * that you are clever and can take control of the calendar - good luck and have fun.
     */
    UNSAFE_setExpanded(expanded: boolean): void {
        this.expanded = expanded;
    }
}
