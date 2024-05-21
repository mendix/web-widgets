export class PopupStore extends EventTarget {
    state = {
        open: false
    };

    setOpen(open: boolean): void {
        if (this.state.open === open) {
            return;
        }
        this.state = { open };
        this.#emitChange();
    }

    toggle(): void {
        this.setOpen(!this.state.open);
    }

    #emitChange(): void {
        this.dispatchEvent(new CustomEvent("change"));
    }
}
