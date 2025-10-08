import { createContextWithStub, FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { SelectAllController } from "@mendix/widget-plugin-grid/selection";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/selection/stores/SelectionCountStore";
import { ProgressStore } from "@mendix/widget-plugin-grid/stores/ProgressStore";
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

import { StaticInfo } from "../../typings/static-info";

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
    | "selectAllPagesEnabled"
    | "selectAllPagesPageSize"
>;

type Gate = DerivedPropsGate<RequiredProps>;

type Spec = {
    gate: Gate;
    exportProgressStore: ProgressStore;
    selectAllProgressStore: ProgressStore;
    selectAllController: SelectAllController;
};

export class RootGridStore extends BaseControllerHost {
    columnsStore: ColumnGroupStore;
    settingsStore: GridPersonalizationStore;
    selectionCountStore: SelectionCountStore;
    basicData: GridBasicData;
    staticInfo: StaticInfo;
    exportProgressStore: ProgressStore;
    selectAllController: SelectAllController;
    selectAllProgressStore: ProgressStore;
    loaderCtrl: DerivedLoaderController;
    paginationCtrl: PaginationController;
    readonly filterAPI: FilterAPI;
    query!: QueryController;

    private gate: Gate;

    constructor({ gate, exportProgressStore, selectAllProgressStore, selectAllController }: Spec) {
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

        this.exportProgressStore = exportProgressStore;

        this.selectAllProgressStore = selectAllProgressStore;

        this.selectAllController = selectAllController;

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
            exp: exportProgressStore,
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
        add(this.setupSelectAllProgressStore());

        return disposeAll;
    }

    private setupSelectAllProgressStore() {
        const controller = this.selectAllController;
        const loadstart = (e: ProgressEvent): void => this.selectAllProgressStore.onloadstart(e);
        const loadend = (e: ProgressEvent): void => this.selectAllProgressStore.onloadstart(e);
        const progress = (e: ProgressEvent): void => this.selectAllProgressStore.onprogress(e);

        controller.addEventListener("loadstart", loadstart);
        controller.addEventListener("loadend", loadend);
        controller.addEventListener("abort", loadend);
        controller.addEventListener("progress", progress);

        return () => {
            controller.removeEventListener("loadstart", loadstart);
            controller.removeEventListener("loadend", loadend);
            controller.removeEventListener("abort", loadend);
            controller.removeEventListener("progress", progress);
        };
    }

    private updateProps(props: RequiredProps): void {
        this.columnsStore.updateProps(props);
        this.settingsStore.updateProps(props);
    }
}
