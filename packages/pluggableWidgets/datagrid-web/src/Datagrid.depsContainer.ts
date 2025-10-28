import { FilterAPI, WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import {
    DatasourceService,
    QueryService,
    RefreshController,
    SelectionCounterViewModel
} from "@mendix/widget-plugin-grid/main";
import { ClosableGateProvider } from "@mendix/widget-plugin-mobx-kit/ClosableGateProvider";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";

import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected, token } from "brandi";
import { useEffect } from "react";
import { DatagridContainerProps, SelectionCounterPositionEnum } from "../typings/DatagridProps";
import { DatasourceParamsController } from "./controllers/DatasourceParamsController";
import { DerivedLoaderController, DerivedLoaderControllerConfig } from "./controllers/DerivedLoaderController";
import { PaginationConfig, PaginationController } from "./controllers/PaginationController";
import { ProgressStore } from "./features/data-export/ProgressStore";
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

/** Root Datagrid container that resolve and inject dependencies. */
export const rootContainer = new Container();

/** Tokens to resolve dependencies from the container. */
export const TOKENS = {
    basicDate: token<GridBasicData>("GridBasicData"),
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    combinedFilter: token<CombinedFilter>("CombinedFilter"),
    combinedFilterConfig: token<CombinedFilterConfig>("CombinedFilterKey"),
    exportProgressService: token<ProgressStore>("ExportProgressService"),
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
    refreshService: token<RefreshController>("DatagridRefreshService"),
    selectionCounter: token<SelectionCounterViewModel>("SelectionCounterViewModel"),
    selectionCounterPosition: token<SelectionCounterPositionEnum>("SelectionCounterPositionEnum"),
    setupService: token<SetupComponentHost>("DatagridSetupHost"),
    staticInfo: token<StaticInfo>("StaticInfo")
};

class DatagridContainer extends Container {
    constructor() {
        super();

        // Column store
        this.bind(TOKENS.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();
        injected(ColumnGroupStore, TOKENS.setupService, TOKENS.mainGate, TOKENS.staticInfo, TOKENS.filterHost);

        // Basic data store
        this.bind(TOKENS.basicDate).toInstance(GridBasicData).inSingletonScope();
        injected(GridBasicData, TOKENS.mainGate);

        // Combined filter
        this.bind(TOKENS.combinedFilter).toInstance(CombinedFilter).inSingletonScope();
        injected(CombinedFilter, TOKENS.setupService, TOKENS.combinedFilterConfig);

        // Export progress store
        this.bind(TOKENS.exportProgressService).toInstance(ProgressStore).inSingletonScope();

        // FilterAPI
        this.bind(TOKENS.filterAPI).toInstance(WidgetFilterAPI).inSingletonScope();
        injected(WidgetFilterAPI, TOKENS.parentChannelName, TOKENS.filterHost);

        // Filter host
        this.bind(TOKENS.filterHost).toInstance(CustomFilterHost).inSingletonScope();

        // Datasource params service
        this.bind(TOKENS.paramsService).toInstance(DatasourceParamsController).inSingletonScope();
        injected(
            DatasourceParamsController,
            TOKENS.setupService,
            TOKENS.query,
            TOKENS.combinedFilter,
            TOKENS.columnsStore
        );

        // Personalization service
        this.bind(TOKENS.personalizationService).toInstance(GridPersonalizationStore).inSingletonScope();
        injected(
            GridPersonalizationStore,
            TOKENS.setupService,
            TOKENS.mainGate,
            TOKENS.columnsStore,
            TOKENS.filterHost
        );

        // Query service
        this.bind(TOKENS.query).toInstance(DatasourceService).inSingletonScope();
        injected(DatasourceService, TOKENS.setupService, TOKENS.mainGate);

        // Pagination service
        this.bind(TOKENS.paginationService).toInstance(PaginationController).inSingletonScope();
        injected(PaginationController, TOKENS.setupService, TOKENS.paginationConfig, TOKENS.query);

        // Refresh service
        this.bind(TOKENS.refreshService).toInstance(RefreshController).inSingletonScope();
        injected(RefreshController, TOKENS.setupService, TOKENS.query, TOKENS.refreshInterval.optional);

        // Setup service
        this.bind(TOKENS.setupService).toInstance(DatagridSetupService).inSingletonScope();

        // Events channel for child widgets
        this.bind(TOKENS.parentChannelName)
            .toInstance(() => `datagrid/${generateUUID()}`)
            .inSingletonScope();

        // Loader view model
        this.bind(TOKENS.loaderViewModel).toInstance(DerivedLoaderController).inSingletonScope();
        injected(
            DerivedLoaderController,
            TOKENS.query,
            TOKENS.exportProgressService,
            TOKENS.columnsStore,
            TOKENS.loaderConfig
        );

        // Selection counter view model
        this.bind(TOKENS.selectionCounter).toInstance(SelectionCounterViewModel).inSingletonScope();
        injected(SelectionCounterViewModel, TOKENS.mainGate, TOKENS.selectionCounterPosition);
    }
}

export function useDatagridDepsContainer(props: DatagridContainerProps): Container {
    const [container, mainGateProvider] = useConst(
        /** Function to clone container and setup prop dependant bindings. */
        function init(): [Container, GateProvider<MainGateProps>] {
            const container = new DatagridContainer();
            const exportProgress = container.get(TOKENS.exportProgressService);
            const gateProvider = new ClosableGateProvider<MainGateProps>(props, () => exportProgress.exporting);

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
            container.get(TOKENS.refreshService);
            container.get(TOKENS.paramsService);
            container.get(TOKENS.paginationService);

            // Hydrate filters from props
            container.get(TOKENS.combinedFilter).hydrate(props.datasource.filter);

            return [container, gateProvider];
        }
    );

    // Run setup hooks on mount
    useSetup(() => container.get(TOKENS.setupService));

    // Push props through the main gate
    useEffect(() => mainGateProvider.setProps(props));

    return container;
}
