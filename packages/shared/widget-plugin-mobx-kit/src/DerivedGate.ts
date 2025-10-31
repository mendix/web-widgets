import { computed, makeObservable } from "mobx";
import { DerivedPropsGate } from "./interfaces/DerivedPropsGate";

export class DerivedGate<T> implements DerivedPropsGate<T> {
    constructor(protected atom: { props: T }) {
        makeObservable(this, { props: computed });
    }

    get props(): T {
        return this.atom.props;
    }
}
