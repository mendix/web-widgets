export function tuple<T1>(t1: T1): [T1];
export function tuple<T1, T2>(t1: T1, t2: T2): [T1, T2];
export function tuple<T1, T2, T3>(t1: T1, t2: T2, t3: T3): [T1, T2, T3];
export function tuple(...args: any[]): any {
    return args;
}
