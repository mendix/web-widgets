/** Tokens to resolve dependencies from the container. */

import { FilterAPI } from "@mendix/widget-plugin-filtering/context";
import { CombinedFilter, CombinedFilterConfig } from "@mendix/widget-plugin-filtering/stores/generic/CombinedFilter";
import { CustomFilterHost } from "@mendix/widget-plugin-filtering/stores/generic/CustomFilterHost";
import { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { GridPageControl } from "@mendix/widget-plugin-grid/interfaces/GridPageControl";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import {
    QueryService,
    SelectActionsService,
    SelectionDynamicProps,
    SelectionHelperService
} from "@mendix/widget-plugin-grid/main";
import {
    DynamicPaginationFeature,
    PageSizeStore,
    PaginationViewModel,
    SetPageAction
} from "@mendix/widget-plugin-grid/pagination/main";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { ComputedAtom, DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { SortAPI } from "@mendix/widget-plugin-sorting/react/context";
import { SortInstruction } from "@mendix/widget-plugin-sorting/types/store";
import { token } from "brandi";
import { ListValue, ObjectItem } from "mendix";
import { ReactNode } from "react";
import { ItemEventsViewModel } from "../features/item-interaction/ItemEvents.viewModel";
import { GalleryGateProps } from "../typings/GalleryGateProps";
import { EmptyPlaceholderViewModel } from "../view-models/EmptyPlaceholder.viewModel";
import { GalleryItemViewModel } from "../view-models/GalleryItem.viewModel";
import { GalleryRootViewModel } from "../view-models/GalleryRoot.viewModel";
import { GalleryConfig } from "./configs/Gallery.config";
import { GalleryPaginationConfig } from "./configs/GalleryPagination.config";
import { LayoutService } from "./services/Layout.service";
import { LoaderService } from "./services/Loader.service";
import { QueryParamsService } from "./services/QueryParams.service";
import { TextsService } from "./services/Texts.service";

const label = (name: string): string => `Gallery[${name}]`;

/** Core tokens shared across containers through root container. */
export const CORE_TOKENS = {
    data: {
        hasMoreItems: token<ComputedAtom<boolean | undefined>>(label("@computed:hasMoreItems")),
        itemCount: token<ComputedAtom<number>>(label("@computed:itemCount")),
        limit: token<ComputedAtom<number>>(label("@computed:limit")),
        offset: token<ComputedAtom<number>>(label("@computed:offset")),
        totalCount: token<ComputedAtom<number>>(label("@computed:totalCount")),
        isAllItemsPresent: token<ComputedAtom<boolean>>(label("@computed:isAllItemsPresent"))
    },

    mainGate: token<DerivedPropsGate<GalleryGateProps>>(label("@gate:mainGate")),
    setupService: token<SetupComponentHost>(label("@service:setupService")),
    config: token<GalleryConfig>(label("@config:galleryConfig")),
    items: token<ComputedAtom<ObjectItem[]>>(label("@computed:items")),

    selection: {
        selectedCount: token<ComputedAtom<number>>(label("@computed:selectedCount")),
        isAllItemsSelected: token<ComputedAtom<boolean>>(label("@computed:isAllItemsSelected")),
        isCurrentPageSelected: token<ComputedAtom<boolean>>(label("@computed:isCurrentPageSelected")),
        selectedCounterTextsStore: token<{
            clearSelectionButtonLabel: string;
            selectedCountText: string;
        }>(label("@store:selectedCounterTextsStore"))
    },

    // pagination
    initPageSize: token<number>(label("@const:initPageSize")),
    pageSizeStore: token<PageSizeStore>(label("@store:PageSizeStore")),

    // texts
    texts: token<TextsService>(label("@service:texts"))
};

export const GY_TOKENS = {
    // query
    query: token<QueryService>(label("@service:query")),
    queryGate: token<DerivedPropsGate<{ datasource: ListValue }>>(label("@gate:queryGate")),
    refreshInterval: token<number>(label("@const:refreshInterval")),
    queryParams: token<QueryParamsService>(label("@service:queryParams")),

    // filtering
    combinedFilter: token<CombinedFilter>(label("@service:combinedFilter")),
    combinedFilterConfig: token<CombinedFilterConfig>(label("@config:combinedFilterConfig")),
    filterAPI: token<FilterAPI>(label("@service:filterAPI")),
    filterHost: token<CustomFilterHost>(label("@service:filterHost")),
    parentChannelName: token<string>(label("@const:parentChannelName")),

    // sorting
    sortAPI: token<SortAPI>(label("@service:sortAPI")),
    sortHost: token<{ sortOrder: SortInstruction[] | undefined }>(label("@service:sortHost")),
    sortHostConfig: token<{ initSort: SortInstruction[] }>(label("@config:sortHostConfig")),

    // view models
    galleryRootVM: token<GalleryRootViewModel>(label("@viewModel:galleryRootVM")),
    galleryItemVM: token<GalleryItemViewModel>(label("@viewModel:galleryItemVM")),
    emptyPlaceholderVM: token<EmptyPlaceholderViewModel>(label("@viewModel:emptyPlaceholderVM")),

    // loader
    loaderConfig: token<{ refreshIndicator: boolean; showSilentRefresh: boolean }>(label("@config:loaderConfig")),
    loader: token<LoaderService>(label("@service:loader")),

    // selection
    selectionCounterConfig: token<{ position: "top" | "bottom" | "off" }>(label("@config:selectionCounterConfig")),
    selectionCounterVM: token<SelectionCounterViewModel>(label("@viewModel:selectionCounterVM")),
    selectionGate: token<DerivedPropsGate<SelectionDynamicProps>>(label("@gate:selectionGate")),
    selectionHelper: token<SelectionHelperService>(label("@service:selectionHelper")),
    selectActions: token<SelectActionsService>(label("@service:selectActions")),
    selectionType: token<"Single" | "Multi" | "None">(label("@const:selectionType")),

    // keyboard navigation, layout and click
    clickActionHelper: token<ClickActionHelper>(label("@service:clickActionHelper")),
    itemEventsVM: token<ComputedAtom<ItemEventsViewModel>>(label("@service:itemEventsVM")),
    keyNavFocusService: token<FocusTargetController>(label("@service:keyNavFocusService")),
    layoutService: token<LayoutService>(label("@service:layoutService")),
    numberOfColumns: token<ComputedAtom<number>>(label("@computed:numberOfColumns")),
    virtualLayout: token<ComputedAtom<VirtualGridLayout>>(label("@computed:virtualLayout")),

    paging: {
        currentPage: token<ComputedAtom<number>>(label("@computed:currentPage")),
        customPagination: token<ComputedAtom<ReactNode>>(label("@computed:customPagination")),
        dynamicPage: token<ComputedAtom<number>>(label("@computed:dynamicPage")),
        dynamicPageSize: token<ComputedAtom<number>>(label("@computed:dynamicPageSize")),
        dynamicPagination: token<DynamicPaginationFeature>(label("@feature:dynamicPagination")),
        pageControl: token<GridPageControl>(label("@service:pageControl")),
        pageSize: token<ComputedAtom<number>>(label("@computed:pageSize")),
        paginationConfig: token<GalleryPaginationConfig>(label("@config:paginationConfig")),
        paginationVM: token<PaginationViewModel>(label("@viewModel:paginationVM")),
        setPageAction: token<SetPageAction>("@action:setPage"),
        setPageSizeAction: token<SetPageAction>("@action:setPageSize")
    }
};
