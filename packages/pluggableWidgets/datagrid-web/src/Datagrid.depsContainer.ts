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
import { Container, injected, token } from "brandi";
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
import { SelectAllBarViewModel } from "./view-models/SelectAllBarViewModel";
import { SelectionProgressDialogViewModel } from "./view-models/SelectionProgressDialogViewModel";

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
    | "selectAllTemplate"
    | "selectAllText"
    | "itemSelection"
    | "datasource"
    | "allSelectedText"
    | "selectAllRowsLabel"
    | "cancelSelectionLabel"
    | "selectionCounterPosition"
    | "enableSelectAll"
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
    queryGate: token<DerivedPropsGate<Pick<DatagridContainerProps, "datasource">>>("GateForQuery"),
    refreshInterval: token<number>("refreshInterval"),
    selectionCounter: token<SelectionCounterViewModel>("SelectionCounterViewModel"),
    selectionCounterPosition: token<SelectionCounterPositionEnum>("SelectionCounterPositionEnum"),
    setupService: token<SetupComponentHost>("DatagridSetupHost"),
    staticInfo: token<StaticInfo>("StaticInfo"),
    enableSelectAll: token<boolean>("enableSelectAll"),
    selectAllProgressService: token<TaskProgressService>("SelectAllProgressService"),
    selectAllGate: token<DerivedPropsGate<SelectAllGateProps>>("SelectAllGateForProps"),
    selectAllService: token<SelectAllService>("SelectAllService"),
    selectAllBar: token<SelectAllBarViewModel>("SelectAllBarViewModel"),
    selectionDialogViewModel: token<SelectionProgressDialogViewModel>("SelectionProgressDialogViewModel")
};

/** Deps injections */
injected(ColumnGroupStore, TOKENS.setupService, TOKENS.mainGate, TOKENS.staticInfo, TOKENS.filterHost);
injected(GridBasicData, TOKENS.mainGate);
injected(CombinedFilter, TOKENS.setupService, TOKENS.combinedFilterConfig);
injected(WidgetFilterAPI, TOKENS.parentChannelName, TOKENS.filterHost);
injected(DatasourceParamsController, TOKENS.setupService, TOKENS.query, TOKENS.combinedFilter, TOKENS.columnsStore);
injected(GridPersonalizationStore, TOKENS.setupService, TOKENS.mainGate, TOKENS.columnsStore, TOKENS.filterHost);
injected(PaginationController, TOKENS.setupService, TOKENS.paginationConfig, TOKENS.query);
injected(DatasourceService, TOKENS.setupService, TOKENS.queryGate, TOKENS.refreshInterval.optional);
injected(DerivedLoaderController, TOKENS.query, TOKENS.exportProgressService, TOKENS.columnsStore, TOKENS.loaderConfig);
injected(SelectionCounterViewModel, TOKENS.mainGate, TOKENS.selectionCounterPosition);
injected(SelectAllService, TOKENS.setupService, TOKENS.selectAllGate, TOKENS.query, TOKENS.selectAllProgressService);
injected(
    SelectAllBarViewModel,
    TOKENS.setupService,
    TOKENS.mainGate,
    TOKENS.selectAllService,
    TOKENS.selectionCounter,
    TOKENS.enableSelectAll
);
injected(
    SelectionProgressDialogViewModel,
    TOKENS.setupService,
    TOKENS.mainGate,
    TOKENS.selectAllProgressService,
    TOKENS.selectAllService
);

/**
 * Root container for bindings that can be shared down the hierarchy.
 * Use only for bindings that needs to be shared across multiple containers.
 * @remark Don't bind things that depend on props here.
 */
class RootContainer extends Container {
    id = `DatagridRootContainer@${generateUUID()}`;

    constructor() {
        super();
        this.bind(TOKENS.setupService).toInstance(DatagridSetupService).inSingletonScope();
    }
}

class DatagridContainer extends Container {
    id = `DatagridContainer@${generateUUID()}`;
    /**
     * Setup container bindings.
     * @remark Make sure not to bind things that already exist in root container.
     */
    init(props: MainGateProps, root: RootContainer, selectAllModule: Container): DatagridContainer {
        this.extend(root);

        // Connect select all module
        const selectAllService = selectAllModule.get(TOKENS.selectAllService);
        const selectAllProgress = selectAllModule.get(TOKENS.selectAllProgressService);
        // Bind select all service
        this.bind(TOKENS.selectAllService).toConstant(selectAllService);
        // Bind select all progress
        this.bind(TOKENS.selectAllProgressService).toConstant(selectAllProgress);

        // Create main gate
        this.bind(TOKENS.exportProgressService).toInstance(ProgressService).inSingletonScope();
        const exportProgress = this.get(TOKENS.exportProgressService);
        const gateProvider = new ClosableGateProvider<MainGateProps>(props, function isLocked() {
            return exportProgress.inProgress || selectAllProgress.inProgress;
        });
        this.setProps = props => gateProvider.setProps(props);

        // Bind main gate
        this.bind(TOKENS.mainGate).toConstant(gateProvider.gate);
        this.bind(TOKENS.queryGate).toConstant(gateProvider.gate);

        // Columns store
        this.bind(TOKENS.columnsStore).toInstance(ColumnGroupStore).inSingletonScope();

        // Basic data store
        this.bind(TOKENS.basicDate).toInstance(GridBasicData).inSingletonScope();

        // Combined filter
        this.bind(TOKENS.combinedFilter).toInstance(CombinedFilter).inSingletonScope();

        // Export progress
        this.bind(TOKENS.exportProgressService).toInstance(ProgressService).inSingletonScope();

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

        // Events channel for child widgets
        this.bind(TOKENS.parentChannelName)
            .toInstance(() => `Datagrid@${generateUUID()}`)
            .inSingletonScope();

        // Loader view model
        this.bind(TOKENS.loaderViewModel).toInstance(DerivedLoaderController).inSingletonScope();

        // Selection counter view model
        this.bind(TOKENS.selectionCounter).toInstance(SelectionCounterViewModel).inSingletonScope();

        // Select all bar view model
        this.bind(TOKENS.selectAllBar).toInstance(SelectAllBarViewModel).inSingletonScope();

        // Selection progress dialog view model
        this.bind(TOKENS.selectionDialogViewModel).toInstance(SelectionProgressDialogViewModel).inSingletonScope();

        // Bind static info
        this.bind(TOKENS.staticInfo).toConstant({
            name: props.name,
            filtersChannelName: this.get(TOKENS.parentChannelName)
        });

        // Bind refresh interval
        this.bind(TOKENS.refreshInterval).toConstant(props.refreshInterval * 1000);

        // Bind combined filter config
        this.bind(TOKENS.combinedFilterConfig).toConstant({
            stableKey: props.name,
            inputs: [this.get(TOKENS.filterHost), this.get(TOKENS.columnsStore)]
        });

        // Bind loader config
        this.bind(TOKENS.loaderConfig).toConstant({
            showSilentRefresh: props.refreshInterval > 1,
            refreshIndicator: props.refreshIndicator
        });

        // Bind pagination config
        this.bind(TOKENS.paginationConfig).toConstant({
            pagination: props.pagination,
            showPagingButtons: props.showPagingButtons,
            showNumberOfRows: props.showNumberOfRows,
            pageSize: props.pageSize
        });

        // Bind selection counter position
        this.bind(TOKENS.selectionCounterPosition).toConstant(props.selectionCounterPosition);

        // Bind select all enabled flag
        this.bind(TOKENS.enableSelectAll).toConstant(props.enableSelectAll);

        // Make sure essential services are created upfront
        this.get(TOKENS.paramsService);
        this.get(TOKENS.paginationService);

        // Hydrate filters from props
        this.get(TOKENS.combinedFilter).hydrate(props.datasource.filter);

        return this;
    }

    setProps = (_props: MainGateProps): void => {
        throw new Error(`${this.id} is not initialized yet`);
    };
}

type SelectAllGateProps = Pick<DatagridContainerProps, "itemSelection" | "datasource">;

/** Module used to create select all service with independent set of deps. */
class SelectAllModule extends Container {
    id = `SelectAllModule@${generateUUID()}`;
    init(props: SelectAllGateProps, root: RootContainer): SelectAllModule {
        this.extend(root);

        const gateProvider = new GateProvider<SelectAllGateProps>(props);
        this.setProps = props => gateProvider.setProps(props);

        // Bind service deps
        this.bind(TOKENS.selectAllGate).toConstant(gateProvider.gate);
        this.bind(TOKENS.queryGate).toConstant(gateProvider.gate);
        this.bind(TOKENS.query).toInstance(DatasourceService).inSingletonScope();
        this.bind(TOKENS.selectAllProgressService).toInstance(ProgressService).inSingletonScope();

        // Finally bind select all service
        this.bind(TOKENS.selectAllService).toInstance(SelectAllService).inSingletonScope();

        return this;
    }

    setProps = (_props: SelectAllGateProps): void => {
        throw new Error(`${this.id} is not initialized yet`);
    };
}

export function useDatagridDepsContainer(props: DatagridContainerProps): Container {
    const [container, selectAllModule] = useConst(function init(): [DatagridContainer, SelectAllModule] {
        const root = new RootContainer();
        const selectAllModule = new SelectAllModule().init(props, root);
        const container = new DatagridContainer().init(props, root, selectAllModule);

        return [container, selectAllModule];
    });

    // Run setup hooks on mount
    useSetup(() => container.get(TOKENS.setupService));

    // Push props through the gates
    useEffect(() => {
        container.setProps(props);
        selectAllModule.setProps(props);
    });

    return container;
}
