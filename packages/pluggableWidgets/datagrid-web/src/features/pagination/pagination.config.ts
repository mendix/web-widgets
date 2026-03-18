import { PaginationEnum, PagingPositionEnum, ShowPagingButtonsEnum } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";

export interface PaginationConfig {
    pagination: PaginationEnum;
    pagingPosition: PagingPositionEnum;
    paginationKind: PaginationKind;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    constPageSize: number;
    initPageSize: number;
    isLimitBased: boolean;
    dynamicPageSizeEnabled: boolean;
    dynamicPageEnabled: boolean;
    customPaginationEnabled: boolean;
    requestTotalCount: boolean;
}

export type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}` | "custom";

export function paginationConfig(props: MainGateProps): PaginationConfig {
    const config: PaginationConfig = {
        pagination: props.pagination,
        showPagingButtons: props.showPagingButtons,
        showNumberOfRows: props.showNumberOfRows,
        constPageSize: props.pageSize,
        initPageSize: resolveInitPageSize(props),
        isLimitBased: isLimitBased(props),
        paginationKind: paginationKind(props),
        dynamicPageSizeEnabled: dynamicPageSizeEnabled(props),
        dynamicPageEnabled: dynamicPageEnabled(props),
        customPaginationEnabled: props.useCustomPagination,
        pagingPosition: props.pagingPosition,
        requestTotalCount: requestTotalCount(props)
    };

    return Object.freeze(config);
}

/**
 * Resolves the initial page size for the first datasource fetch.
 * Returns 0 when `dynamicPageSize` is configured so that no rows are fetched
 * before the attribute value is available — the real limit is applied once
 * `DynamicPaginationFeature` syncs the attribute on setup.
 */
export function resolveInitPageSize(props: MainGateProps): number {
    if (props.dynamicPageSize !== undefined) {
        return 0;
    }
    return props.pageSize;
}

export function paginationKind(props: MainGateProps): PaginationKind {
    if (props.useCustomPagination) {
        return "custom";
    }

    return `${props.pagination}.${props.showPagingButtons}`;
}

export function dynamicPageSizeEnabled(props: MainGateProps): boolean {
    return props.dynamicPageSize !== undefined;
}

export function dynamicPageEnabled(props: MainGateProps): boolean {
    return props.dynamicPage !== undefined;
}

function isLimitBased(props: MainGateProps): boolean {
    return props.pagination === "virtualScrolling" || props.pagination === "loadMore";
}

export function requestTotalCount(props: MainGateProps): boolean {
    return props.pagination === "buttons" || props.showNumberOfRows || props.totalCountValue !== undefined;
}
