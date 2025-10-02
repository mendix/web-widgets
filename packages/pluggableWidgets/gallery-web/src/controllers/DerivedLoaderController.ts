import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { computed, makeObservable } from "mobx";

export class DerivedLoaderController {
    constructor(
        private datasourceController: DatasourceController,
        private refreshIndicator: boolean
    ) {
        makeObservable(this, {
            isRefreshing: computed,
            showRefreshIndicator: computed
        });
    }

    get isRefreshing(): boolean {
        const { isSilentRefresh, isRefreshing } = this.datasourceController;
        return !isSilentRefresh && isRefreshing;
    }

    get showRefreshIndicator(): boolean {
        return this.refreshIndicator && this.isRefreshing;
    }
}
