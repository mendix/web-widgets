import { computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "./interfaces/DerivedPropsGate";

/** Helper class to create gate that map props from another gate. */
export class MappedGate<T1, T2> implements DerivedPropsGate<T2> {
    constructor(
        private gate: DerivedPropsGate<T1>,
        private map: (props: T1) => T2
    ) {
        makeObservable(this, { props: computed });
    }

    get props(): T2 {
        return this.map(this.gate.props);
    }
}
