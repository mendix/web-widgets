import { GateProvider } from "./GateProvider";

export class ClosableGateProvider<T> extends GateProvider<T> {
    constructor(props: T, private locked: () => boolean) {
        super(props);
    }

    setProps(props: T): void {
        if (this.locked()) {
            return;
        }
        super.setProps(props);
    }
}
