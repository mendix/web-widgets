import { DerivedPropsGate } from "./DerivedPropsGate";

export interface DerivedPropsGateProvider<T> {
    readonly gate: DerivedPropsGate<T>;
}
