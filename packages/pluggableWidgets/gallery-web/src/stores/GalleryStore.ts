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
import { EditableValue, ListValue } from "mendix";
import { AttributeStorage } from "src/stores/AttributeStorage";
import { BrowserStorage } from "src/stores/BrowserStorage";
import { GalleryPersistentStateController } from "src/stores/GalleryPersistentStateController";
import { ObservableStorage } from "src/typings/storage";
import { PaginationEnum, StateStorageTypeEnum } from "../../typings/GalleryProps";
import { QueryParamsController } from "../controllers/QueryParamsController";

interface DynamicProps {
    datasource: ListValue;
    stateStorageAttr?: EditableValue<string>;
}

interface StaticProps {
    pagination: PaginationEnum;
    showPagingButtons: "always" | "auto";
    showTotalCount: boolean;
    pageSize: number;
    name: string;
    stateStorageType: StateStorageTypeEnum;
    storeFilters: boolean;
    storeSort: boolean;
}

export type GalleryPropsGate = DerivedPropsGate<DynamicProps>;

type GalleryStoreSpec = StaticProps & {
    gate: GalleryPropsGate;
};

export class GalleryStore extends BaseControllerHost {
    private readonly _query: DatasourceController;
    private readonly _filtersHost: CustomFilterHost;
    private readonly _sortHost: SortStoreHost;
    private _storage: ObservableStorage | null = null;

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

        this._filtersHost = new CustomFilterHost();
        this._sortHost = new SortStoreHost();

        const paramCtrl = new QueryParamsController(this, this._query, this._filtersHost, this._sortHost);

        this.filterAPI = createContextWithStub({
            filterObserver: this._filtersHost,
            parentChannelName: this.id,
            sharedInitFilter: paramCtrl.unzipFilter(spec.gate.props.datasource.filter)
        });

        this.sortAPI = {
            version: 1,
            host: this._sortHost,
            initSortOrder: spec.gate.props.datasource.sortOrder
        };

        new RefreshController(this, {
            delay: 0,
            query: this._query.derivedQuery
        });

        const useStorage = spec.storeFilters || spec.storeSort;
        if (useStorage) {
            this.initPersistentStorage(spec, spec.gate);
        }
    }

    initPersistentStorage(props: StaticProps, gate: GalleryPropsGate): void {
        if (props.stateStorageType === "localStorage") {
            this._storage = new BrowserStorage(this.name);
        } else if (gate.props.stateStorageAttr) {
            this._storage = new AttributeStorage(
                this,
                gate as DerivedPropsGate<{ stateStorageAttr: EditableValue<string> }>
            );
        }

        if (!this._storage) {
            return;
        }

        new GalleryPersistentStateController(this, {
            storage: this._storage,
            filtersHost: this._filtersHost,
            sortHost: this._sortHost,
            storeFilters: props.storeFilters,
            storeSort: props.storeSort
        });
    }
}
