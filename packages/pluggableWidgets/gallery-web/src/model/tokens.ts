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
import { DynamicPaginationFeature, PageSizeStore } from "@mendix/widget-plugin-grid/pagination/main";
import { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import { ComputedAtom, DerivedPropsGate, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { SortInstruction } from "@mendix/widget-plugin-sorting/types/store";
import { token } from "brandi";
import { ListValue } from "mendix";
import { ReactNode } from "react";
import { ItemEventsController } from "../features/item-interaction/ItemEventsController";
import { GalleryGateProps } from "../typings/GalleryGateProps";
import { GalleryRootViewModel } from "../view-models/GalleryRoot.viewModel";
import { GalleryConfig } from "./configs/Gallery.config";
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
    sortHost: token<{ sortOrder: SortInstruction[] | undefined }>(label("@service:sortHost")),
    sortHostConfig: token<{ initSort: SortInstruction[] }>(label("@config:sortHostConfig")),

    // gallery root
    galleryRootVM: token<GalleryRootViewModel>(label("@viewModel:galleryRootVM")),

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

    // keyboard navigation
    virtualLayout: token<ComputedAtom<VirtualGridLayout>>(label("@computed:virtualLayout")),
    focusService: token<FocusTargetController>(label("@service:focusService")),

    // item interaction
    clickActionHelper: token<ClickActionHelper>(label("@service:clickActionHelper")),
    itemEventsHandler: token<ItemEventsController>(label("@service:itemEventsHandler")),

    paging: {
        currentPage: token<ComputedAtom<number>>(label("@computed:currentPage")),
        customPagination: token<ComputedAtom<ReactNode>>(label("@computed:customPagination")),
        dynamicPage: token<ComputedAtom<number>>(label("@computed:dynamicPage")),
        dynamicPageSize: token<ComputedAtom<number>>(label("@computed:dynamicPageSize")),
        dynamicPagination: token<DynamicPaginationFeature>(label("@feature:dynamicPagination")),
        pageControl: token<GridPageControl>(label("@service:pageControl")),
        pageSize: token<ComputedAtom<number>>(label("@computed:pageSize")),
        paginationConfig: token<any>(label("@config:paginationConfig")),
        paginationVM: token<any>(label("@viewModel:paginationVM")),
        setPageAction: token<any>(label("@action:setPageAction")),
        setPageSizeAction: token<any>(label("@action:setPageSizeAction"))
    }
};
