import { computed, makeObservable } from "mobx";

type Spec = {
    exp: { exporting: boolean };
    cols: { loaded: boolean };
    query: { isLoadingMore: boolean; isLoading: boolean; isRefreshing: boolean };
};

export class DerivedLoaderController {
    constructor(private spec: Spec) {
        makeObservable(this, {
            isLoading: computed,
            isLoadingMore: computed,
            isRefreshing: computed
        });
    }

    get isLoading(): boolean {
        const { cols, exp, query } = this.spec;
        if (!cols.loaded) {
            return true;
        }

        if (exp.exporting) {
            return false;
        }

        return query.isLoading;
    }

    get isLoadingMore(): boolean {
        return this.spec.query.isLoadingMore;
    }

    get isRefreshing(): boolean {
        return this.spec.query.isRefreshing;
    }
}
