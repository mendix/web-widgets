import { compactArray, fromCompactArray, isAnd } from "@mendix/filter-commons/condition-utils";
import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { PaginationController } from "@mendix/widget-plugin-grid/query/PaginationController";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { ListValue } from "mendix";
import { FilterCondition } from "mendix/filters";
import { makeAutoObservable, reaction } from "mobx";
import { PaginationEnum } from "../../typings/GalleryProps";

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

class QueryParamsController implements ReactiveController {
    private readonly _query: DatasourceController;
    private readonly _filters: CustomFilterHost;

    constructor(host: ReactiveControllerHost, query: DatasourceController, filters: CustomFilterHost) {
        host.addController(this);

        this._query = query;
        this._filters = filters;

        makeAutoObservable(this, { setup: false });
    }

    private get _derivedSortOrder(): ListValue["sortOrder"] {
        return [];
    }

    private get _derivedFilter(): FilterCondition {
        return compactArray(this._filters.conditions);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(
            reaction(
                () => this._derivedSortOrder,
                sortOrder => this._query.setSortOrder(sortOrder),
                { fireImmediately: true }
            )
        );
        add(
            reaction(
                () => this._derivedFilter,
                filter => this._query.setFilter(filter),
                { fireImmediately: true }
            )
        );

        return disposeAll;
    }

    unzipFilter(filter?: FilterCondition): Array<FilterCondition | undefined> {
        if (!filter || !isAnd(filter)) {
            return [];
        }
        return fromCompactArray(filter);
    }
}
