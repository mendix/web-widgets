import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import {
    QueryService,
    SelectActionsService,
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
import { ListValue, ObjectItem } from "mendix";
import { CSSProperties, ReactNode } from "react";
import { MainGateProps } from "../../typings/MainGateProps";
import { WidgetRootViewModel } from "../features/base/WidgetRoot.viewModel";
import { EmptyPlaceholderViewModel } from "../features/empty-message/EmptyPlaceholder.viewModel";
import { CellEventsController } from "../features/row-interaction/CellEventsController";
import { CheckboxEventsController } from "../features/row-interaction/CheckboxEventsController";
import { SelectAllBarViewModel } from "../features/select-all/SelectAllBar.viewModel";
import { SelectionProgressDialogViewModel } from "../features/select-all/SelectionProgressDialog.viewModel";
import { ColumnGroupStore } from "../helpers/state/ColumnGroupStore";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { GridPersonalizationStore } from "../helpers/state/GridPersonalizationStore";
import { DatasourceParamsController } from "../model/services/DatasourceParamsController";
import { GridColumn } from "../typings/GridColumn";
import { DatagridConfig } from "./configs/Datagrid.config";
import { RowClassProvider } from "./models/rows.model";
import { DatagridSetupService } from "./services/DatagridSetup.service";
import { DerivedLoaderController, DerivedLoaderControllerConfig } from "./services/DerivedLoaderController";
import { PaginationConfig, PaginationService } from "./services/Pagination.service";
import { TextsService } from "./services/Texts.service";
import { PageSizeStore } from "./stores/PageSize.store";

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
        isAllItemsPresent: token<ComputedAtom<boolean>>("@computed:isAllItemsPresent"),
        pageSize: token<ComputedAtom<number>>("@computed:pageSize"),
        columnCount: token<ComputedAtom<number>>("@computed:columnCount")
    },
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    initPageSize: token<number>("@const:initialPageSize"),
    pageSizeStore: token<PageSizeStore>("@store:PageSizeStore"),
    column: token<GridColumn>("@store:GridColumn"),
    rows: token<ComputedAtom<ObjectItem[]>>("@computed:rowsArray"),

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

    setupService: token<DatagridSetupService>("DatagridSetupService"),

    texts: token<TextsService>("@srv:TextsService")
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
    paginationService: token<PaginationService>("PaginationService"),

    parentChannelName: token<string>("parentChannelName"),
    refreshInterval: token<number>("refreshInterval"),

    paramsService: token<DatasourceParamsController>("DatagridParamsService"),
    personalizationService: token<GridPersonalizationStore>("GridPersonalizationStore"),

    query: token<QueryService>("QueryService"),
    queryGate: token<DerivedPropsGate<{ datasource: ListValue }>>("@gate:GateForQueryService"),

    selectionCounterCfg: token<{ position: "top" | "bottom" | "off" }>("SelectionCounterConfig"),
    selectionCounterVM: token<SelectionCounterViewModel>("SelectionCounterViewModel"),

    selectionGate: token<DerivedPropsGate<SelectionDynamicProps>>("@gate:GateForSelectionHelper"),
    selectionHelper: token<SelectionHelperService>("@service:SelectionHelperService"),
    selectActions: token<SelectActionsService>("@service:SelectActionsService"),
    selectionType: token<"Single" | "Multi" | "None">("@const:selectionType"),

    gridColumnsStyle: token<ComputedAtom<CSSProperties>>("@computed:GridColumnsStyle"),

    rowClass: token<RowClassProvider>("@store:RowClassProvider"),

    datagridRootVM: token<WidgetRootViewModel>("WidgetRootViewModel"),

    virtualLayout: token<ComputedAtom<VirtualGridLayout>>("@computed:virtualLayout"),
    clickActionHelper: token<ClickActionHelper>("@service:ClickActionHelper"),
    focusService: token<FocusTargetController>("@service:FocusTargetController"),
    checkboxEventsHandler: token<CheckboxEventsController>("@service:CheckboxEventsController"),
    cellEventsHandler: token<CellEventsController>("@service:CellEventsController")
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
