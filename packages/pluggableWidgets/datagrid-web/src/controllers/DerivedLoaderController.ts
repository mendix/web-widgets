import { QueryService } from "@mendix/widget-plugin-grid/main";
import { computed, makeObservable } from "mobx";
import { ProgressStore } from "../features/data-export/ProgressStore";
import { IColumnGroupStore } from "../helpers/state/ColumnGroupStore";

export interface DerivedLoaderControllerConfig {
    showSilentRefresh: boolean;
    refreshIndicator: boolean;
}

export class DerivedLoaderController {
    constructor(
        private query: QueryService,
        private exp: ProgressStore,
        private cols: IColumnGroupStore,
        private config: DerivedLoaderControllerConfig
    ) {
        makeObservable(this, {
            isFirstLoad: computed,
            isFetchingNextBatch: computed,
            isRefreshing: computed
        });
    }

    get isFirstLoad(): boolean {
        const { cols, exp, query } = this;
        if (!cols.loaded) {
            return true;
        }

        if (exp.exporting) {
            return false;
        }

        return query.isFirstLoad;
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
        return this.config.refreshIndicator ? this.isRefreshing : false;
    }
}
