export type FnName<T> = T extends { name: infer Name } ? Name : never;

export type Dispose = () => void;

export type GConstructor<T = unknown> = new (...args: any[]) => T;
