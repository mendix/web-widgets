import { action, computed, makeObservable, observable } from "mobx";
import { DerivedPropsGate, DerivedPropsGateProvider } from "./props-gate";

class DerivedGate<T> implements DerivedPropsGate<T> {
    constructor(protected atom: { props: T }) {
        makeObservable(this, { props: computed });
    }

    get props(): T {
        return this.atom.props;
    }
}

class PropsAtom<T> {
    constructor(public props: T) {
        makeObservable(this, { props: observable.ref, setProps: action });
    }

    setProps(props: T): void {
        this.props = props;
    }
}

export class GateProvider<T> implements DerivedPropsGateProvider<T> {
    private atom: PropsAtom<T>;
    readonly gate: DerivedPropsGate<T>;

    constructor(props: T) {
        this.atom = new PropsAtom(props);
        this.gate = new DerivedGate(this.atom);
    }

    setProps(props: T): void {
        this.atom.setProps(props);
    }
}
