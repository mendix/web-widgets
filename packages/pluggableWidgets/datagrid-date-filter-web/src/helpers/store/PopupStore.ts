export class PopupStore extends EventTarget {
    open = false;

    setOpen(open: boolean): void {
        if (this.open === open) {
            return;
        }
        this.open = open;
        this.#emitChange();
    }

    toggle(): void {
        this.setOpen(!this.open);
    }

    #emitChange(): void {
        this.dispatchEvent(new CustomEvent("change"));
    }
}
