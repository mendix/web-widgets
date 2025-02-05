export function disposeBatch(): [add: (fn: () => void) => void, disposeAll: () => void] {
    const disposers = new Set<() => void>();

    const add = (fn: () => void): void => {
        disposers.add(fn);
    };

    const disposeAll = (): void => {
        for (const fn of disposers) {
            fn();
        }
        disposers.clear();
    };
    return [add, disposeAll];
}
