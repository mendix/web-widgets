import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { PaginationController } from "@mendix/widget-plugin-grid/query/PaginationController";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
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
}

type Gate = DerivedPropsGate<DynamicProps>;

type GalleryStoreSpec = StaticProps & {
    gate: Gate;
};

export class GalleryStore extends BaseControllerHost {
    private readonly _id: string;
    private readonly _query: DatasourceController;
    readonly paging: PaginationController;
    readonly filterAPI: FilterAPI;

    constructor(spec: GalleryStoreSpec) {
        super();

        this._id = `GalleryStore@${generateUUID()}`;

        this._query = new DatasourceController(this, { gate: spec.gate });

        this.paging = new PaginationController(this, {
            gate: undefined,
            query: this._query,
            pageSize: spec.pageSize,
            pagination: spec.pagination,
            showPagingButtons: spec.showPagingButtons,
            showTotalCount: true
        });

        const filterObserver = new CustomFilterHost();

        const paramCtrl = new QueryParamsController(this, this._query, filterObserver);

        this.filterAPI = createContextWithStub({
            filterObserver,
            parentChannelName: this._id,
            sharedInitFilter: paramCtrl.unzipFilter(spec.gate.props.datasource.filter)
        });

        new RefreshController(this, {
            delay: 0,
            query: this._query.derivedQuery
        });
    }
}
