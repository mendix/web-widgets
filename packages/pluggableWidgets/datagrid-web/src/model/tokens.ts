import { FilterAPI, WidgetFilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import {
    DatasourceService,
    QueryService,
    SelectAllService,
    SelectionCounterViewModel,
    TaskProgressService
} from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { injected, token } from "brandi";
import { ListValue } from "mendix";
import { SelectionCounterPositionEnum } from "../../typings/DatagridProps";
import { MainGateProps } from "../../typings/MainGateProps";
import { SelectAllBarViewModel } from "../features/select-all/SelectAllBar.viewModel";
import { SelectAllGateProps } from "../features/select-all/SelectAllGateProps";
import { SelectionProgressDialogViewModel } from "../features/select-all/SelectionProgressDialog.viewModel";
import { ColumnGroupStore } from "../helpers/state/ColumnGroupStore";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { GridPersonalizationStore } from "../helpers/state/GridPersonalizationStore";
import { DatasourceParamsController } from "../model/services/DatasourceParamsController";
import { DatagridConfig } from "./configs/Datagrid.config";
import { DerivedLoaderController, DerivedLoaderControllerConfig } from "./services/DerivedLoaderController";
import { PaginationConfig, PaginationController } from "./services/PaginationController";

/** Tokens to resolve dependencies from the container. Please keep in alphabetical order. */
export const TOKENS = {
    basicDate: token<GridBasicData>("GridBasicData"),
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    combinedFilter: token<CombinedFilter>("CombinedFilter"),
    combinedFilterConfig: token<CombinedFilterConfig>("CombinedFilterKey"),
    config: token<DatagridConfig>("DatagridConfig"),
    enableSelectAll: token<boolean>("enableSelectAll"),
    exportProgressService: token<TaskProgressService>("ExportProgressService"),
    filterAPI: token<FilterAPI>("FilterAPI"),
    filterHost: token<CustomFilterHost>("FilterHost"),
    loaderConfig: token<DerivedLoaderControllerConfig>("DatagridLoaderConfig"),
    loaderVM: token<DerivedLoaderController>("DatagridLoaderViewModel"),
    mainGate: token<DerivedPropsGate<MainGateProps>>("MainGate"),
    paginationConfig: token<PaginationConfig>("PaginationConfig"),
    paginationService: token<PaginationController>("PaginationService"),
    paramsService: token<DatasourceParamsController>("DatagridParamsService"),
    parentChannelName: token<string>("parentChannelName"),
    personalizationService: token<GridPersonalizationStore>("GridPersonalizationStore"),
    query: token<QueryService>("QueryService"),
    queryGate: token<DerivedPropsGate<{ datasource: ListValue }>>("GateForQueryService"),
    refreshInterval: token<number>("refreshInterval"),
    selectAllBarVM: token<SelectAllBarViewModel>("SelectAllBarViewModel"),
    selectAllGate: token<DerivedPropsGate<SelectAllGateProps>>("GateForSelectAllService"),
    selectAllProgressService: token<TaskProgressService>("SelectAllProgressService"),
    selectAllService: token<SelectAllService>("SelectAllService"),
    selectionCounterPosition: token<SelectionCounterPositionEnum>("SelectionCounterPositionEnum"),
    selectionCounterVM: token<SelectionCounterViewModel>("SelectionCounterViewModel"),
    selectionDialogVM: token<SelectionProgressDialogViewModel>("SelectionProgressDialogViewModel"),
    setupService: token<SetupComponentHost>("DatagridSetupHost")
};

/** Inject dependencies */

injected(ColumnGroupStore, TOKENS.setupService, TOKENS.mainGate, TOKENS.config, TOKENS.filterHost);

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
    TOKENS.selectionCounterVM,
    TOKENS.enableSelectAll
);

injected(
    SelectionProgressDialogViewModel,
    TOKENS.setupService,
    TOKENS.mainGate,
    TOKENS.selectAllProgressService,
    TOKENS.selectAllService
);
