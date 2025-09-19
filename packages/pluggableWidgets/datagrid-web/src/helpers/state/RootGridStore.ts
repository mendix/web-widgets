import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
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
import { MultiPageSelectionController } from "../../features/multi-page-selection/MultiPageSelectionController";
import { StaticInfo } from "../../typings/static-info";
import { ColumnGroupStore } from "./ColumnGroupStore";
import { GridPersonalizationStore } from "./GridPersonalizationStore";
import { SelectActionHelper } from "../SelectActionHelper";

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
    multiPageSelectionCtrl: MultiPageSelectionController;
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

        this.multiPageSelectionCtrl = new MultiPageSelectionController(this, {
            query,
            progressStore: this.selectAllProgressStore
        });

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
        const ds = this.gate.props.datasource;
        const selectionHelper = this.basicData.currentSelectionHelper;

        if (!selectionHelper) {
            return;
        }

        // Check if multi-page selection is possible
        const canSelect = this.multiPageSelectionCtrl.canSelectAllPages(
            selectActionHelper.canSelectAllPages,
            selectActionHelper.selectionType
        );

        if (!canSelect) {
            selectActionHelper.onSelectAll("selectAll");
            return;
        }

        // Delegate to the controller
        const success = await this.multiPageSelectionCtrl.selectAllPages(ds, selectionHelper);

        if (!success) {
            selectActionHelper.onSelectAll("selectAll");
        }
    }

    abortMultiPageSelect(): void {
        this.multiPageSelectionCtrl.abort();
    }
}
