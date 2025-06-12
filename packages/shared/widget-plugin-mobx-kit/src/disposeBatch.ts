type MaybeFn = (() => void) | void;

export function disposeBatch(): [add: (fn: MaybeFn) => void, disposeAll: () => void] {
    const disposers = new Set<() => void>();

    const add = (fn: MaybeFn): void => {
        if (fn) {
            disposers.add(fn);
        }
    };

    const disposeAll = (): void => {
        for (const fn of disposers) {
            fn();
        }
        disposers.clear();
    };
    return [add, disposeAll];
}
