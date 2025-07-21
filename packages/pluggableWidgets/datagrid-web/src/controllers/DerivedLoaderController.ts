import { computed, makeObservable } from "mobx";

type DerivedLoaderControllerSpec = {
    exp: { exporting: boolean };
    cols: { loaded: boolean };
    query: { isFetchingNextBatch: boolean; isFirstLoad: boolean; isRefreshing: boolean };
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
        if (!cols.loaded) {
            return true;
        }

        if (exp.exporting) {
            return false;
        }

        return query.isFirstLoad;
    }

    get isFetchingNextBatch(): boolean {
        return this.spec.query.isFetchingNextBatch;
    }

    get isRefreshing(): boolean {
        return this.spec.query.isRefreshing;
    }
}
