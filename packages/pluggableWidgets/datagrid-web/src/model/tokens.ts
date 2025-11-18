import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import {
    QueryService,
    SelectAllService,
    SelectionDynamicProps,
    SelectionHelperService,
    TaskProgressService
} from "@mendix/widget-plugin-grid/main";
import { SelectAllFeature } from "@mendix/widget-plugin-grid/select-all/select-all.feature";
import {
    BarStore,
    ObservableSelectAllTexts,
    SelectAllEvents
} from "@mendix/widget-plugin-grid/select-all/select-all.model";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { ComputedAtom, DerivedPropsGate, Emitter } from "@mendix/widget-plugin-mobx-kit/main";
import { token } from "brandi";
import { ListValue } from "mendix";
import { CSSProperties, ReactNode } from "react";
import { MainGateProps } from "../../typings/MainGateProps";
import { EmptyPlaceholderViewModel } from "../features/empty-message/EmptyPlaceholder.viewModel";
import { SelectAllBarViewModel } from "../features/select-all/SelectAllBar.viewModel";
import { SelectionProgressDialogViewModel } from "../features/select-all/SelectionProgressDialog.viewModel";
import { ColumnGroupStore } from "../helpers/state/ColumnGroupStore";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { GridPersonalizationStore } from "../helpers/state/GridPersonalizationStore";
import { DatasourceParamsController } from "../model/services/DatasourceParamsController";
import { GridColumn } from "../typings/GridColumn";
import { DatagridConfig } from "./configs/Datagrid.config";
import { DatagridSetupService } from "./services/DatagridSetup.service";
import { DerivedLoaderController, DerivedLoaderControllerConfig } from "./services/DerivedLoaderController";
import { PaginationConfig, PaginationController } from "./services/PaginationController";

/** Tokens to resolve dependencies from the container. */

/** Core tokens shared across containers through root container. */
export const CORE_TOKENS = {
    atoms: {
        hasMoreItems: token<ComputedAtom<boolean | undefined>>("@computed:hasMoreItems"),
        itemCount: token<ComputedAtom<number>>("@computed:itemCount"),
        limit: token<ComputedAtom<number>>("@computed:limit"),
        offset: token<ComputedAtom<number>>("@computed:offset"),
        totalCount: token<ComputedAtom<number>>("@computed:totalCount"),
        visibleColumnsCount: token<ComputedAtom<number>>("@computed:visibleColumnsCount"),
        isAllItemsPresent: token<ComputedAtom<boolean>>("@computed:isAllItemsPresent")
    },
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    column: token<GridColumn>("@store:GridColumn"),

    config: token<DatagridConfig>("DatagridConfig"),

    mainGate: token<DerivedPropsGate<MainGateProps>>("@gate:MainGate"),

    selection: {
        selectedCount: token<ComputedAtom<number>>("@computed:selectedCount"),
        isAllItemsSelected: token<ComputedAtom<boolean>>("@computed:isAllItemsSelected"),
        isCurrentPageSelected: token<ComputedAtom<boolean>>("@computed:isCurrentPageSelected"),
        selectedCounterTextsStore: token<{
            clearSelectionButtonLabel: string;
            selectedCountText: string;
        }>("@store:selectedCounterTextsStore")
    },

    setupService: token<DatagridSetupService>("DatagridSetupService")
};

/** Datagrid tokens. */
export const DG_TOKENS = {
    basicDate: token<GridBasicData>("GridBasicData"),

    combinedFilter: token<CombinedFilter>("CombinedFilter"),
    combinedFilterConfig: token<CombinedFilterConfig>("CombinedFilterKey"),

    emptyPlaceholderVM: token<EmptyPlaceholderViewModel>("EmptyPlaceholderViewModel"),
    emptyPlaceholderWidgets: token<ComputedAtom<ReactNode>>("@computed:emptyPlaceholder"),

    exportProgressService: token<TaskProgressService>("ExportProgressService"),

    filterAPI: token<FilterAPI>("FilterAPI"),
    filterHost: token<CustomFilterHost>("FilterHost"),

    loaderConfig: token<DerivedLoaderControllerConfig>("DatagridLoaderConfig"),
    loaderVM: token<DerivedLoaderController>("DatagridLoaderViewModel"),

    paginationConfig: token<PaginationConfig>("PaginationConfig"),
    paginationService: token<PaginationController>("PaginationService"),

    parentChannelName: token<string>("parentChannelName"),
    refreshInterval: token<number>("refreshInterval"),

    paramsService: token<DatasourceParamsController>("DatagridParamsService"),
    personalizationService: token<GridPersonalizationStore>("GridPersonalizationStore"),

    query: token<QueryService>("QueryService"),
    queryGate: token<DerivedPropsGate<{ datasource: ListValue }>>("@gate:GateForQueryService"),

    selectionCounterCfg: token<{ position: "top" | "bottom" | "off" }>("SelectionCounterConfig"),
    selectionCounterVM: token<SelectionCounterViewModel>("SelectionCounterViewModel"),

    selectionGate: token<DerivedPropsGate<SelectionDynamicProps>>("@gate:GateForSelectionHelper"),
    selectionHelper: token<SelectionHelperService | undefined>("SelectionHelperService"),

    gridColumnsStyle: token<ComputedAtom<CSSProperties>>("@computed:GridColumnsStyle")
};

/** "Select all" module tokens. */
export const SA_TOKENS = {
    barStore: token<BarStore>("SelectAllBarStore"),
    emitter: token<Emitter<SelectAllEvents>>("SelectAllEmitter"),
    gate: token<DerivedPropsGate<MainGateProps>>("MainGateForSelectAllContainer"),
    progressService: token<TaskProgressService>("SelectAllProgressService"),
    selectAllTextsStore: token<ObservableSelectAllTexts>("SelectAllTextsStore"),
    selectAllBarVM: token<SelectAllBarViewModel>("SelectAllBarViewModel"),
    selectAllService: token<SelectAllService>("SelectAllService"),
    selectionDialogVM: token<SelectionProgressDialogViewModel>("SelectionProgressDialogViewModel"),
    enableSelectAll: token<boolean>("enableSelectAllFeatureFlag"),
    feature: token<SelectAllFeature>("SelectAllFeature")
};
