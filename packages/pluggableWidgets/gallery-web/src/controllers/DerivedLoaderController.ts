import { DatasourceService } from "@mendix/widget-plugin-grid/main";
import { computed, makeObservable } from "mobx";

export class DerivedLoaderController {
    constructor(
        private datasourceService: DatasourceService,
        private refreshIndicator: boolean
    ) {
        makeObservable(this, {
            isRefreshing: computed,
            showRefreshIndicator: computed
        });
    }

    get isRefreshing(): boolean {
        const { isSilentRefresh, isRefreshing } = this.datasourceService;
        return !isSilentRefresh && isRefreshing;
    }

    get showRefreshIndicator(): boolean {
        return this.refreshIndicator && this.isRefreshing;
    }
}
