import { FilterAPI, WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import {
    DatasourceService,
    ProgressService,
    QueryService,
    SelectAllService,
    SelectionCounterViewModel,
    TaskProgressService
} from "@mendix/widget-plugin-grid/main";
import { ClosableGateProvider } from "@mendix/widget-plugin-mobx-kit/ClosableGateProvider";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";

import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, DependencyModule, injected, token } from "brandi";
import { useEffect } from "react";
import { DatagridContainerProps, SelectionCounterPositionEnum } from "../typings/DatagridProps";
import { DatasourceParamsController } from "./controllers/DatasourceParamsController";
import { DerivedLoaderController, DerivedLoaderControllerConfig } from "./controllers/DerivedLoaderController";
import { PaginationConfig, PaginationController } from "./controllers/PaginationController";
import { ColumnGroupStore } from "./helpers/state/ColumnGroupStore";
import { GridBasicData } from "./helpers/state/GridBasicData";
import { GridPersonalizationStore } from "./helpers/state/GridPersonalizationStore";
import { DatagridSetupService } from "./services/DatagridSetupService";
import { StaticInfo } from "./typings/static-info";

/** Type to declare props available through main gate. */
type MainGateProps = Pick<
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
    | "clearSelectionButtonLabel"
>;

/** Tokens to resolve dependencies from the container. */
export const TOKENS = {
    basicDate: token<GridBasicData>("GridBasicData"),
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    combinedFilter: token<CombinedFilter>("CombinedFilter"),
    combinedFilterConfig: token<CombinedFilterConfig>("CombinedFilterKey"),
    exportProgressService: token<TaskProgressService>("ExportProgressService"),
    filterAPI: token<FilterAPI>("FilterAPI"),
    filterHost: token<CustomFilterHost>("FilterHost"),
    loaderConfig: token<DerivedLoaderControllerConfig>("DatagridLoaderConfig"),
    loaderViewModel: token<DerivedLoaderController>("DatagridLoaderViewModel"),
    mainGate: token<DerivedPropsGate<MainGateProps>>("MainGateForProps"),
    paginationConfig: token<PaginationConfig>("PaginationConfig"),
    paginationService: token<PaginationController>("PaginationService"),
    paramsService: token<DatasourceParamsController>("DatagridParamsService"),
    parentChannelName: token<string>("parentChannelName"),
    personalizationService: token<GridPersonalizationStore>("GridPersonalizationStore"),
    query: token<QueryService>("QueryService"),
    refreshInterval: token<number>("refreshInterval"),
    selectionCounter: token<SelectionCounterViewModel>("SelectionCounterViewModel"),
    selectionCounterPosition: token<SelectionCounterPositionEnum>("SelectionCounterPositionEnum"),
    setupService: token<SetupComponentHost>("DatagridSetupHost"),
    staticInfo: token<StaticInfo>("StaticInfo"),
    selectAllProgressService: token<TaskProgressService>("SelectAllProgressService"),
    selectAllGate: token<DerivedPropsGate<SelectAllGateProps>>("SelectAllGateForProps"),
    selectAllQuery: token<QueryService>("SelectAllQueryService"),
    SelectAllService: token<SelectAllService>("SelectAllService")
};

/** Deps injections */
injected(ColumnGroupStore, TOKENS.setupService, TOKENS.mainGate, TOKENS.staticInfo, TOKENS.filterHost);
injected(GridBasicData, TOKENS.mainGate);
injected(CombinedFilter, TOKENS.setupService, TOKENS.combinedFilterConfig);
injected(WidgetFilterAPI, TOKENS.parentChannelName, TOKENS.filterHost);
injected(DatasourceParamsController, TOKENS.setupService, TOKENS.query, TOKENS.combinedFilter, TOKENS.columnsStore);
injected(GridPersonalizationStore, TOKENS.setupService, TOKENS.mainGate, TOKENS.columnsStore, TOKENS.filterHost);
injected(PaginationController, TOKENS.setupService, TOKENS.paginationConfig, TOKENS.query);
injected(DatasourceService, TOKENS.setupService, TOKENS.mainGate, TOKENS.refreshInterval.optional);
injected(DerivedLoaderController, TOKENS.query, TOKENS.exportProgressService, TOKENS.columnsStore, TOKENS.loaderConfig);
injected(SelectionCounterViewModel, TOKENS.mainGate, TOKENS.selectionCounterPosition);
injected(
    SelectAllService,
    TOKENS.setupService,
    TOKENS.selectAllGate,
    TOKENS.selectAllQuery,
    TOKENS.selectAllProgressService
);

class DatagridContainer extends Container {
    constructor() {
        super();

        // Column store
        this.bind(TOKENS.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();

        // Basic data store
        this.bind(TOKENS.basicDate).toInstance(GridBasicData).inSingletonScope();

        // Combined filter
        this.bind(TOKENS.combinedFilter).toInstance(CombinedFilter).inSingletonScope();

        // Export progress
        this.bind(TOKENS.exportProgressService).toInstance(ProgressService).inSingletonScope();

        // Select all progress
        this.bind(TOKENS.selectAllProgressService).toInstance(ProgressService).inSingletonScope();

        // FilterAPI
        this.bind(TOKENS.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();

        // Filter host
        this.bind(TOKENS.filterHost).toInstance(CustomFilterHost).inSingletonScope();

        // Datasource params service
        this.bind(TOKENS.paramsService).toInstance(DatasourceParamsController).inSingletonScope();

        // Personalization service
        this.bind(TOKENS.personalizationService).toInstance(GridPersonalizationStore).inSingletonScope();

        // Query service
        this.bind(TOKENS.query).toInstance(DatasourceService).inSingletonScope();

        // Pagination service
        this.bind(TOKENS.paginationService).toInstance(PaginationController).inSingletonScope();

        // Setup service
        this.bind(TOKENS.setupService).toInstance(DatagridSetupService).inSingletonScope();

        // Events channel for child widgets
        this.bind(TOKENS.parentChannelName)
            .toInstance(() => `Datagrid@${generateUUID()}`)
            .inSingletonScope();

        // Loader view model
        this.bind(TOKENS.loaderViewModel).toInstance(DerivedLoaderController).inSingletonScope();

        // Selection counter view model
        this.bind(TOKENS.selectionCounter).toInstance(SelectionCounterViewModel).inSingletonScope();
    }
}

type SelectAllGateProps = Pick<DatagridContainerProps, "itemSelection" | "datasource">;
class SelectAllModule extends DependencyModule {
    selectAllGateProvider: GateProvider<SelectAllGateProps>;
    constructor(props: SelectAllGateProps) {
        super();
        this.selectAllGateProvider = new GateProvider<SelectAllGateProps>(props);
        // Bind gate
        this.bind(TOKENS.selectAllGate).toConstant(this.selectAllGateProvider.gate);
        // Bind query
        this.bind(TOKENS.selectAllQuery).toInstance(DatasourceService).inSingletonScope();
        // Bind progress
        this.bind(TOKENS.selectAllProgressService).toInstance(ProgressService).inSingletonScope();
        // Bind service
        this.bind(TOKENS.SelectAllService).toInstance(SelectAllService).inSingletonScope();
    }
}

export function useDatagridDepsContainer(props: DatagridContainerProps): Container {
    const [container, mainGateHost, selectAllGateHost] = useConst(
        /** Function to clone container and setup prop dependant bindings. */
        function init(): [Container, GateProvider<MainGateProps>, GateProvider<SelectAllGateProps>] {
            const container = new DatagridContainer();
            const selectAllModule = new SelectAllModule(props);

            container.use(TOKENS.selectAllProgressService).from(selectAllModule);
            container.use(TOKENS.SelectAllService).from(selectAllModule);

            const exportProgress = container.get(TOKENS.exportProgressService);
            const selectAllProgress = container.get(TOKENS.selectAllProgressService);
            const gateProvider = new ClosableGateProvider<MainGateProps>(props, function isLocked() {
                return exportProgress.inProgress || selectAllProgress.inProgress;
            });

            // Bind main gate
            container.bind(TOKENS.mainGate).toConstant(gateProvider.gate);

            // Bind static info
            container.bind(TOKENS.staticInfo).toConstant({
                name: props.name,
                filtersChannelName: container.get(TOKENS.parentChannelName)
            });

            container.bind(TOKENS.refreshInterval).toConstant(props.refreshInterval * 1000);

            // Bind combined filter config
            container.bind(TOKENS.combinedFilterConfig).toConstant({
                stableKey: props.name,
                inputs: [container.get(TOKENS.filterHost), container.get(TOKENS.columnsStore)]
            });

            // Bind loader config
            container.bind(TOKENS.loaderConfig).toConstant({
                showSilentRefresh: props.refreshInterval > 1,
                refreshIndicator: props.refreshIndicator
            });

            // Bind pagination config
            container.bind(TOKENS.paginationConfig).toConstant({
                pagination: props.pagination,
                showPagingButtons: props.showPagingButtons,
                showNumberOfRows: props.showNumberOfRows,
                pageSize: props.pageSize
            });

            // Bind selection counter position
            container.bind(TOKENS.selectionCounterPosition).toConstant(props.selectionCounterPosition);

            // Make sure essential services are created upfront
            container.get(TOKENS.paramsService);
            container.get(TOKENS.paginationService);

            // Hydrate filters from props
            container.get(TOKENS.combinedFilter).hydrate(props.datasource.filter);

            return [container, gateProvider, selectAllModule.selectAllGateProvider];
        }
    );

    // Run setup hooks on mount
    useSetup(() => container.get(TOKENS.setupService));

    // Push props through the gates
    useEffect(() => {
        mainGateHost.setProps(props);
        selectAllGateHost.setProps(props);
    });

    return container;
}
