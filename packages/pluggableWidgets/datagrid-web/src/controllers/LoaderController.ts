import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue } from "mendix";
import { computed, makeObservable, observable, runInAction, when } from "mobx";

type Gate = DerivedPropsGate<{ datasource: ListValue }>;

type Spec = {
    gate: Gate;
    exp: { exporting: boolean };
    cols: { loaded: boolean };
    pagination: { isLoadingMore: boolean; isLoading: boolean };
};

export class LoaderController implements ReactiveController {
    private hasBeenLoaded = false;

    constructor(host: ReactiveControllerHost, private spec: Spec) {
        host.addController(this);
        type PrivateMembers = "hasBeenLoaded";
        makeObservable<this, PrivateMembers>(this, {
            isLoading: computed,
            isLoadingMore: computed,
            hasBeenLoaded: observable
        });
    }

    private get datasource(): ListValue {
        return this.spec.gate.props.datasource;
    }

    get isLoading(): boolean {
        const { cols, exp, pagination } = this.spec;
        if (!cols.loaded || !this.hasBeenLoaded) {
            return true;
        }

        if (exp.exporting || this.isLoadingMore) {
            return false;
        }

        return pagination.isLoading;
    }

    get isLoadingMore(): boolean {
        return this.spec.pagination.isLoadingMore;
    }

    setup(): () => void {
        return when(
            () => this.datasource.status !== "loading",
            () => runInAction(() => (this.hasBeenLoaded = true))
        );
    }
}
