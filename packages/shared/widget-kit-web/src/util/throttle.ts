type AbortFn = () => void;
type Fn<R> = () => R;
type Fn1<A1, R> = (a: A1) => R;
type Fn2<A1, A2, R> = (a1: A1, a2: A2) => R;
type Fn3<A1, A2, A3, R> = (a1: A1, a2: A2, a3: A3) => R;
type Func<T extends any[], R> = (...a: T) => R;

export function throttle<R>(func: Fn<R>, wait: number): [Fn<void>, AbortFn];

export function throttle<A1, R>(func: Fn1<A1, R>, wait: number): [Fn1<A1, void>, AbortFn];

export function throttle<A1, A2, R>(func: Fn2<A1, A2, R>, wait: number): [Fn2<A1, A2, void>, AbortFn];

export function throttle<A1, A2, A3, R>(func: Fn3<A1, A2, A3, R>, wait: number): [Fn3<A1, A2, A3, void>, AbortFn];

export function throttle<R>(func: Func<any, R>, wait: number): [Func<any, void>, AbortFn] {
    let timeoutID = 0;
    let last = 0;

    // We should not touch `last` in abort.
    const abort = (): void => {
        clearTimeout(timeoutID);
        timeoutID = 0;
    };

    const fn = (...args: any[]): void => {
        const delta = new Date().getTime() - last;
        const cb = (): void => {
            timeoutID = 0;
            last = new Date().getTime();
            func(...args);
        };

        if (!timeoutID) {
            if (delta >= wait) {
                cb();
            } else {
                timeoutID = window.setTimeout(cb, wait - delta);
            }
        }
    };

    return [fn, abort];
}
