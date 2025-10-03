import { computed, makeObservable } from "mobx";

type DerivedLoaderControllerSpec = {
    showSilentRefresh: boolean;
    refreshIndicator: boolean;
    exp: { inProgress: boolean };
    cols: { loaded: boolean };
    query: {
        isFetchingNextBatch: boolean;
        isFirstLoad: boolean;
        isRefreshing: boolean;
        isSilentRefresh: boolean;
    };
};

export class DerivedLoaderController {
    constructor(private spec: DerivedLoaderControllerSpec) {
        makeObservable(this, {
            isFirstLoad: computed,
            isFetchingNextBatch: computed,
            isRefreshing: computed
        });
    }

    get isFirstLoad(): boolean {
        const { cols, exp, query } = this.spec;

        if (!cols.loaded) return true;
        if (exp.inProgress) return false;
        return query.isFirstLoad;
    }

    get isFetchingNextBatch(): boolean {
        return this.spec.query.isFetchingNextBatch;
    }

    get isRefreshing(): boolean {
        const { isSilentRefresh, isRefreshing } = this.spec.query;

        if (this.spec.showSilentRefresh) {
            return isSilentRefresh || isRefreshing;
        }

        return !isSilentRefresh && isRefreshing;
    }

    get showRefreshIndicator(): boolean {
        if (!this.spec.refreshIndicator) {
            return false;
        }

        return this.isRefreshing;
    }
}
