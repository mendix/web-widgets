export interface DerivedPropsGate<T> {
    readonly props: T;
}

export interface DerivedPropsGateProvider<T> {
    readonly gate: DerivedPropsGate<T>;
}
