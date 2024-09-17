export type FnName<T> = T extends { name: infer Name } ? Name : never;
