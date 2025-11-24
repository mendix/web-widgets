import { DatasourceService } from "@mendix/widget-plugin-grid/main";
import { computed, makeObservable } from "mobx";

export class DerivedLoaderController {
    constructor(
        private datasourceService: DatasourceService,
        private refreshIndicator: boolean,
        private showSilentRefresh: boolean
    ) {
        makeObservable(this, {
            isFirstLoad: computed,
            isFetchingNextBatch: computed,
            isRefreshing: computed
        });
    }

    get isFirstLoad(): boolean {
        return this.datasourceService.isFirstLoad;
    }

    get isFetchingNextBatch(): boolean {
        return this.datasourceService.isFetchingNextBatch;
    }

    get isRefreshing(): boolean {
        const { isSilentRefresh, isRefreshing } = this.datasourceService;

        if (this.showSilentRefresh) {
            return isSilentRefresh || isRefreshing;
        }

        return !isSilentRefresh && isRefreshing;
    }

    get showRefreshIndicator(): boolean {
        if (!this.refreshIndicator) {
            return false;
        }

        return this.isRefreshing;
    }
}
