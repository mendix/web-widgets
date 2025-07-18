import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { PaginationController } from "@mendix/widget-plugin-grid/query/PaginationController";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { SortAPI } from "@mendix/widget-plugin-sorting/react/context";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { ListValue } from "mendix";
import { PaginationEnum } from "../../typings/GalleryProps";
import { QueryParamsController } from "../controllers/QueryParamsController";

interface DynamicProps {
    datasource: ListValue;
}

interface StaticProps {
    pagination: PaginationEnum;
    showPagingButtons: "always" | "auto";
    showTotalCount: boolean;
    pageSize: number;
    name: string;
}

export type GalleryPropsGate = DerivedPropsGate<DynamicProps>;

type GalleryStoreSpec = StaticProps & {
    gate: GalleryPropsGate;
};

export class GalleryStore extends BaseControllerHost {
    private readonly _query: DatasourceController;

    readonly id: string = `GalleryStore@${generateUUID()}`;
    readonly name: string;
    readonly paging: PaginationController;
    readonly filterAPI: FilterAPI;
    readonly sortAPI: SortAPI;

    constructor(spec: GalleryStoreSpec) {
        super();

        this.name = spec.name;

        this._query = new DatasourceController(this, { gate: spec.gate });

        this.paging = new PaginationController(this, {
            query: this._query,
            pageSize: spec.pageSize,
            pagination: spec.pagination,
            showPagingButtons: spec.showPagingButtons,
            showTotalCount: spec.showTotalCount
        });

        const filterObserver = new CustomFilterHost();
        const sortObserver = new SortStoreHost();

        const paramCtrl = new QueryParamsController(this, this._query, filterObserver, sortObserver);

        this.filterAPI = createContextWithStub({
            filterObserver,
            parentChannelName: this.id,
            sharedInitFilter: paramCtrl.unzipFilter(spec.gate.props.datasource.filter)
        });

        this.sortAPI = {
            version: 1,
            host: sortObserver,
            initSortOrder: spec.gate.props.datasource.sortOrder
        };

        new RefreshController(this, {
            delay: 0,
            query: this._query.derivedQuery
        });
    }
}
