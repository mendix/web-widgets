type AbortFn = () => void;

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number): [F, AbortFn] => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const abort = (): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    const debounced = (...args: Parameters<F>): void => {
        abort();
        timeout = setTimeout(() => func(...args), waitFor);
    };

    return [debounced as F, abort];
};
