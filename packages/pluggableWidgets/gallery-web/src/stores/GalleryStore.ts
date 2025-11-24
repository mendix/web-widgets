import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceService, SelectionCounterViewModel } from "@mendix/widget-plugin-grid/main";

import { DerivedPropsGate, SetupHost } from "@mendix/widget-plugin-mobx-kit/main";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { SortAPI } from "@mendix/widget-plugin-sorting/react/context";
import { SortStoreHost } from "@mendix/widget-plugin-sorting/stores/SortStoreHost";
import { DynamicValue, EditableValue, ListValue, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { PaginationEnum, StateStorageTypeEnum } from "../../typings/GalleryProps";
import { DerivedLoaderController } from "../controllers/DerivedLoaderController";
import { QueryParamsController } from "../controllers/QueryParamsController";
import { PaginationController } from "../services/PaginationController";
import { ObservableStorage } from "../typings/storage";
import { AttributeStorage } from "./AttributeStorage";
import { BrowserStorage } from "./BrowserStorage";
import { GalleryPersistentStateController } from "./GalleryPersistentStateController";

interface DynamicProps {
    datasource: ListValue;
    stateStorageAttr?: EditableValue<string>;
    itemSelection?: SelectionSingleValue | SelectionMultiValue;
    sCountFmtSingular?: DynamicValue<string>;
    sCountFmtPlural?: DynamicValue<string>;
    selectionCountPosition: "top" | "bottom" | "off";
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
    refreshIndicator: boolean;
    refreshInterval: number;
}

export type GalleryPropsGate = DerivedPropsGate<DynamicProps>;

type GalleryStoreSpec = StaticProps & {
    gate: GalleryPropsGate;
};

export class GalleryStore extends SetupHost {
    private readonly _query: DatasourceService;
    private readonly _filtersHost: CustomFilterHost;
    private readonly _sortHost: SortStoreHost;
    private _storage: ObservableStorage | null = null;

    readonly id: string = `GalleryStore@${generateUUID()}`;
    readonly name: string;
    readonly paging: PaginationController;
    readonly filterAPI: FilterAPI;
    readonly sortAPI: SortAPI;
    loaderCtrl: DerivedLoaderController;
    selectionCountStore: SelectionCounterViewModel;

    constructor(spec: GalleryStoreSpec) {
        super();

        this.name = spec.name;

        this._query = new DatasourceService(this, spec.gate, spec.refreshInterval * 1000);

        this.paging = new PaginationController({
            query: this._query,
            pageSize: spec.pageSize,
            pagination: spec.pagination,
            showPagingButtons: spec.showPagingButtons,
            showTotalCount: spec.showTotalCount
        });

        this.selectionCountStore = new SelectionCounterViewModel(spec.gate, spec.gate.props.selectionCountPosition);

        this._filtersHost = new CustomFilterHost();

        const combinedFilter = new CombinedFilter(this, { stableKey: spec.name, inputs: [this._filtersHost] });

        this._sortHost = new SortStoreHost({
            initSort: spec.gate.props.datasource.sortOrder
        });

        new QueryParamsController(this, this._query, combinedFilter, this._sortHost);

        this.filterAPI = createContextWithStub({
            filterObserver: this._filtersHost,
            parentChannelName: this.id
        });

        this.sortAPI = {
            version: 1,
            host: this._sortHost
        };

        this.loaderCtrl = new DerivedLoaderController(this._query, spec.refreshIndicator, spec.refreshInterval >= 1);

        const useStorage = spec.storeFilters || spec.storeSort;
        if (useStorage) {
            this.initPersistentStorage(spec, spec.gate);
        }

        combinedFilter.hydrate(spec.gate.props.datasource.filter);
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
