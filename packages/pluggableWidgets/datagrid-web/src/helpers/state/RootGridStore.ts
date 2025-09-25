import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { clearAllPages, selectAllPages } from "@mendix/widget-plugin-grid/selection/select-all-pages";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/selection/stores/SelectionCountStore";
import { BaseControllerHost } from "@mendix/widget-plugin-mobx-kit/BaseControllerHost";
import { disposeBatch } from "@mendix/widget-plugin-mobx-kit/disposeBatch";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { autorun } from "mobx";
import { GridBasicData } from "src/helpers/state/GridBasicData";
import { DatagridContainerProps } from "../../../typings/DatagridProps";
import { DatasourceParamsController } from "../../controllers/DatasourceParamsController";
import { DerivedLoaderController } from "../../controllers/DerivedLoaderController";
import { PaginationController } from "../../controllers/PaginationController";
import { ProgressStore } from "../../features/data-export/ProgressStore";
import { SelectAllProgressStore } from "../../features/multi-page-selection/SelectAllProgressStore";
import { StaticInfo } from "../../typings/static-info";
import { SelectActionHelper } from "../SelectActionHelper";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";

type RequiredProps = Pick<
    DatagridContainerProps,
    | "name"
    | "datasource"
    | "refreshInterval"
    | "refreshIndicator"
    | "itemSelection"
    | "columns"
    | "configurationStorageType"
    | "storeFiltersInPersonalization"
    | "configurationAttribute"
    | "pageSize"
    | "pagination"
    | "showPagingButtons"
    | "showNumberOfRows"
>;

type Gate = DerivedPropsGate<RequiredProps>;

type Spec = {
    gate: Gate;
    exportCtrl: ProgressStore;
};

export class RootGridStore extends BaseControllerHost {
    columnsStore: ColumnGroupStore;
    settingsStore: GridPersonalizationStore;
    selectionCountStore: SelectionCountStore;
    basicData: GridBasicData;
    staticInfo: StaticInfo;
    exportProgressCtrl: ProgressStore;
    selectAllProgressStore: SelectAllProgressStore;
    private selectAllAbortController?: AbortController;
    private selectAllLocked = false;
    loaderCtrl: DerivedLoaderController;
    paginationCtrl: PaginationController;
    readonly filterAPI: FilterAPI;
    query!: QueryController;

    private gate: Gate;

    constructor({ gate, exportCtrl }: Spec) {
        super();
        const { props } = gate;

        this.gate = gate;

        this.staticInfo = {
            name: props.name,
            filtersChannelName: `datagrid/${generateUUID()}`
        };

        const filterHost = new CustomFilterHost();

        const query = new DatasourceController(this, { gate });
        this.query = query;

        this.filterAPI = createContextWithStub({
            filterObserver: filterHost,
            parentChannelName: this.staticInfo.filtersChannelName
        });

        this.columnsStore = new ColumnGroupStore(props, this.staticInfo, filterHost);

        const combinedFilter = new CombinedFilter(this, {
            stableKey: props.name,
            inputs: [filterHost, this.columnsStore]
        });

        this.settingsStore = new GridPersonalizationStore(props, this.columnsStore, filterHost);

        this.basicData = new GridBasicData(gate);

        this.selectionCountStore = new SelectionCountStore(gate);

        this.paginationCtrl = new PaginationController(this, { gate, query });

        this.exportProgressCtrl = exportCtrl;

        this.selectAllProgressStore = new SelectAllProgressStore();

        new DatasourceParamsController(this, {
            query,
            filterHost: combinedFilter,
            sortHost: this.columnsStore
        });

        new RefreshController(this, {
            query: query.derivedQuery,
            delay: props.refreshInterval * 1000
        });

        this.loaderCtrl = new DerivedLoaderController({
            exp: exportCtrl,
            cols: this.columnsStore,
            showSilentRefresh: props.refreshInterval > 1,
            refreshIndicator: props.refreshIndicator,
            query
        });

        combinedFilter.hydrate(props.datasource.filter);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();
        add(super.setup());
        add(this.columnsStore.setup());
        add(() => this.settingsStore.dispose());
        add(autorun(() => this.updateProps(this.gate.props)));

        return disposeAll;
    }

    private updateProps(props: RequiredProps): void {
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }

    async startMultiPageSelectAll(selectActionHelper: SelectActionHelper): Promise<void> {
        if (this.selectAllLocked) {
            return;
        }

        // Check if multi-page selection is possible
        const canSelect = selectActionHelper.canSelectAllPages;

        if (!canSelect) {
            selectActionHelper.onSelectAll("selectAll");
            return;
        }

        this.selectAllLocked = true;
        this.selectAllAbortController = new AbortController();
        const success = await selectAllPages({
            query: this.query as QueryController,
            gate: this.gate as any,
            progress: this.selectAllProgressStore,
            bufferSize: selectActionHelper.selectAllPagesBufferSize,
            signal: this.selectAllAbortController.signal
        });

        if (!success) {
            selectActionHelper.onSelectAll("selectAll");
        }
        this.selectAllLocked = false;
        this.selectAllAbortController = undefined;
    }

    async clearAllPages(): Promise<void> {
        clearAllPages(this.gate);
    }

    abortMultiPageSelect(): void {
        if (this.selectAllAbortController) {
            this.selectAllAbortController.abort();
            this.selectAllProgressStore.oncancel();
            this.selectAllLocked = false;
            this.selectAllAbortController = undefined;
        }
    }
}
