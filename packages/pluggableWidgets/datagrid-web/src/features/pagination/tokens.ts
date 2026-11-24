import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { ReactNode } from "react";
import type {
    DynamicPaginationFeature,
    GridPageControl,
    PaginationViewModel,
    SetPageAction
} from "@mendix/widget-plugin-grid/pagination/main";
import type { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import type { GridSizeStore } from "./GridSize.store";
import type { PaginationConfig } from "./pagination.config";

export const PAGINATION_TOKENS = {
    currentPage: token<ComputedAtom<number>>("@computed:currentPage"),
    customPagination: token<ComputedAtom<ReactNode>>("@computed:customPagination"),
    dynamicPage: token<ComputedAtom<number>>("@computed:dynamicPage"),
    dynamicPageSize: token<ComputedAtom<number>>("@computed:dynamicPageSize"),
    dynamicPagination: token<DynamicPaginationFeature>("@feature:DynamicPaginationFeature"),
    pageControl: token<GridPageControl>("@service:GridPageControl"),
    pageSize: token<ComputedAtom<number>>("@computed:pageSize"),
    paginationConfig: token<PaginationConfig>("@config:PaginationConfig"),
    paginationVM: token<PaginationViewModel>("@viewModel:PaginationService"),
    setPageAction: token<SetPageAction>("@action:setPage"),
    setPageSizeAction: token<SetPageAction>("@action:setPageSize"),

    gridSizeStore: token<GridSizeStore>("@store:GridSizeStore")
};

export const [usePaginationVM] = createInjectionHooks(PAGINATION_TOKENS.paginationVM);
export const [useGridSizeStore] = createInjectionHooks(PAGINATION_TOKENS.gridSizeStore);
export const [useCustomPagination] = createInjectionHooks(PAGINATION_TOKENS.customPagination);
export const [usePaginationConfig] = createInjectionHooks(PAGINATION_TOKENS.paginationConfig);

export type { GridSizeStore } from "./GridSize.store";
