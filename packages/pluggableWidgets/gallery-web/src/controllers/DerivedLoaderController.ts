type DerivedLoaderControllerSpec = {
    refreshIndicator: boolean;
    query: {
        isRefreshing: boolean;
        isSilentRefresh: boolean;
    };
};

export class DerivedLoaderController {
    constructor(private spec: DerivedLoaderControllerSpec) {}

    get isRefreshing(): boolean {
        const { isSilentRefresh, isRefreshing } = this.spec.query;

        return !isSilentRefresh && isRefreshing;
    }

    get showRefreshIndicator(): boolean {
        if (!this.spec.refreshIndicator) {
            return false;
        }

        return this.isRefreshing;
    }
}
