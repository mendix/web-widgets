export function disposeFx(): [disposers: Array<() => void>, dispose: () => void] {
    const disposers: Array<() => void> = [];
    return [disposers, () => disposers.forEach(dispose => dispose())];
}
