import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue } from "mendix";
import { computed, makeObservable, observable, runInAction, when } from "mobx";

type Gate = DerivedPropsGate<{ datasource: ListValue }>;

type Spec = {
    gate: Gate;
    exp: { exporting: boolean };
    cols: { loaded: boolean };
    refresh: { isRefreshing: boolean };
};

export class LoaderController implements ReactiveController {
    private hasBeenLoaded = false;

    constructor(host: ReactiveControllerHost, private spec: Spec) {
        host.addController(this);
        makeObservable<this, "hasBeenLoaded">(this, {
            showLoader: computed,
            hasBeenLoaded: observable
        });
    }

    private get datasource(): ListValue {
        return this.spec.gate.props.datasource;
    }

    get showLoader(): boolean {
        const { cols, exp, refresh } = this.spec;
        if (!cols.loaded || !this.hasBeenLoaded) {
            return true;
        }

        if (exp.exporting || refresh.isRefreshing) {
            return false;
        }

        return this.datasource.status === "loading";
    }

    setup(): () => void {
        return when(
            () => this.datasource.status !== "loading",
            () => runInAction(() => (this.hasBeenLoaded = true))
        );
    }
}
