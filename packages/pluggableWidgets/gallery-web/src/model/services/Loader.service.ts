import { QueryService } from "@mendix/widget-plugin-grid/main";
import { computed, makeObservable } from "mobx";

export class LoaderService {
    constructor(
        private query: QueryService,
        private config: { refreshIndicator: boolean; showSilentRefresh: boolean }
    ) {
        makeObservable(this, {
            isFirstLoad: computed,
            isFetchingNextBatch: computed,
            isRefreshing: computed
        });
    }

    get isFirstLoad(): boolean {
        return this.query.isFirstLoad;
    }

    get isFetchingNextBatch(): boolean {
        return this.query.isFetchingNextBatch;
    }

    get isRefreshing(): boolean {
        const { isSilentRefresh, isRefreshing } = this.query;

        if (this.config.showSilentRefresh) {
            return isSilentRefresh || isRefreshing;
        }

        return !isSilentRefresh && isRefreshing;
    }

    get showRefreshIndicator(): boolean {
        if (!this.config.refreshIndicator) {
            return false;
        }

        return this.isRefreshing;
    }
}
