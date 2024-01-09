export function removeAllRanges(): void {
    window.getSelection()?.removeAllRanges();
}

export function blockUserSelect(): void {
    document.body.style.userSelect = "none";
}

type UnblockUserSelectFn = {
    (): void;
    timeoutId?: number;
};

export const unblockUserSelect: UnblockUserSelectFn = () => {
    if (unblockUserSelect.timeoutId) {
        clearTimeout(unblockUserSelect.timeoutId);
    }
    unblockUserSelect.timeoutId = window.setTimeout(() => {
        removeAllRanges();
        document.body.style.userSelect = "";
        unblockUserSelect.timeoutId = undefined;
    }, 250);
};
