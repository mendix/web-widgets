import { FilterAPI, WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { QueryController } from "@mendix/widget-plugin-grid/query/query-controller";
import { RefreshController } from "@mendix/widget-plugin-grid/query/RefreshController";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/selection/stores/SelectionCountStore";
import { ClosableGateProvider } from "@mendix/widget-plugin-mobx-kit/ClosableGateProvider";
import { GateProvider } from "@mendix/widget-plugin-mobx-kit/GateProvider";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { useSetup } from "@mendix/widget-plugin-mobx-kit/react/useSetup";
import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { generateUUID } from "@mendix/widget-plugin-platform/framework/generate-uuid";
import { Container, injected, token } from "brandi";
import { useEffect } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { DatasourceParamsController } from "./controllers/DatasourceParamsController";
import { DerivedLoaderController, DerivedLoaderControllerConfig } from "./controllers/DerivedLoaderController";
import { PaginationConfig, PaginationController } from "./controllers/PaginationController";
import { ProgressStore } from "./features/data-export/ProgressStore";
import { ColumnGroupStore } from "./helpers/state/ColumnGroupStore";
import { GridBasicData } from "./helpers/state/GridBasicData";
import { GridPersonalizationStore } from "./helpers/state/GridPersonalizationStore";
import { DatagridSetupService } from "./services/DatagridSetupService";
import { StaticInfo } from "./typings/static-info";

/** Type to declare props available through main gait. */
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
const TOKENS = {
    basicDate: token<GridBasicData>("GridBasicData"),
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    combinedFilter: token<CombinedFilter>("CombinedFilter"),
    combinedFilterConfig: token<CombinedFilterConfig>("CombinedFilterKey"),
    exportProgressService: token<ProgressStore>("ExportProgressService"),
    filterAPI: token<FilterAPI>("FilterAPI"),
    filterHost: token<CustomFilterHost>("FilterHost"),
    loaderViewModel: token<DerivedLoaderController>("DatagridLoaderViewModel"),
    loaderConfig: token<DerivedLoaderControllerConfig>("DatagridLoaderConfig"),
    mainGate: token<DerivedPropsGate<MainGateProps>>("MainGateForProps"),
    paginationService: token<PaginationController>("PaginationService"),
    paginationConfig: token<PaginationConfig>("PaginationConfig"),
    paramsService: token<DatasourceParamsController>("DatagridParamsService"),
    parentChannelName: token<string>("parentChannelName"),
    personalizationService: token<GridPersonalizationStore>("GridPersonalizationStore"),
    query: token<QueryController>("QueryService"),
    refreshService: token<RefreshController>("DatagridRefreshService"),
    refreshInterval: token<number>("refreshInterval"),
    selectionCounter: token<SelectionCountStore>("SelectionCountStore"),
    setupService: token<ReactiveControllerHost>("DatagridSetupHost"),
    staticInfo: token<StaticInfo>("StaticInfo")
};

/** Root Datagrid container that resolve and inject dependencies. */
export const rootContainer = new Container();

// Class bindings, must be unique per container.
rootContainer.bind(TOKENS.columnsStore).toInstance(ColumnGroupStore).inContainerScope();
rootContainer.bind(TOKENS.combinedFilter).toInstance(CombinedFilter).inContainerScope();
rootContainer.bind(TOKENS.exportProgressService).toInstance(ProgressStore).inContainerScope();
rootContainer.bind(TOKENS.filterAPI).toInstance(WidgetFilterAPI).inContainerScope();
rootContainer.bind(TOKENS.filterHost).toInstance(CustomFilterHost).inContainerScope();
rootContainer.bind(TOKENS.query).toInstance(DatasourceController).inContainerScope();
rootContainer.bind(TOKENS.refreshService).toInstance(RefreshController).inContainerScope();
rootContainer.bind(TOKENS.setupService).toInstance(DatagridSetupService).inContainerScope();
rootContainer.bind(TOKENS.paramsService).toInstance(DatasourceParamsController).inContainerScope();
rootContainer
    .bind(TOKENS.parentChannelName)
    .toInstance(() => `datagrid/${generateUUID()}`)
    .inContainerScope();

// Inject dependencies
injected(SelectionCountStore, TOKENS.mainGate);
injected(DatasourceController, TOKENS.setupService, TOKENS.mainGate);
injected(WidgetFilterAPI, TOKENS.parentChannelName, TOKENS.filterHost);
injected(ColumnGroupStore, TOKENS.mainGate, TOKENS.staticInfo, TOKENS.filterHost);
injected(DerivedLoaderController, TOKENS.query, TOKENS.exportProgressService, TOKENS.columnsStore, TOKENS.loaderConfig);
injected(RefreshController, TOKENS.setupService, TOKENS.query, TOKENS.refreshInterval.optional);
injected(DatasourceParamsController, TOKENS.setupService, TOKENS.query, TOKENS.combinedFilter, TOKENS.columnsStore);

/** Create new container that inherit bindings from root container. */
export function createContainer(): Container {
    return new Container().extend(rootContainer);
}

export function useDatagridDepsContainer(props: DatagridContainerProps): Container {
    const [container, mainGateProvider] = useConst(
        /** Function to clone container and setup prop dependant bindings. */
        function init(): [Container, GateProvider<MainGateProps>] {
            const container = createContainer();
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

            // Create internal services
            container.get(TOKENS.refreshService);
            container.get(TOKENS.paramsService);

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
