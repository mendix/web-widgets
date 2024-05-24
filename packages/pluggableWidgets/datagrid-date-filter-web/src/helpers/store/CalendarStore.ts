export class CalendarStore extends EventTarget {
    state = {
        expanded: false
    };

    /**
     * DON'T USE THIS STORE TO CONTROL THE CALENDAR STATE.
     * @remark
     * Do not use this store to control calendar state in react-datepicker.
     * This store exists only to synchronize the aria-expanded attribute on the button.
     * react-datepicker doesn't support controlled mode. So, if you think
     * that you are clever and can take control of the calendar - good luck and have fun.
     */
    UNSAFE_setExpanded(expanded: boolean): void {
        if (this.state.expanded === expanded) {
            return;
        }
        this.state = { expanded };
        this.#emitChange();
    }

    #emitChange(): void {
        this.dispatchEvent(new CustomEvent("change"));
    }
}
