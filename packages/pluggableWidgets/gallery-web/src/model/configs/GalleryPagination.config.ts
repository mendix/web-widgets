import { PaginationEnum, PagingPositionEnum, ShowPagingButtonsEnum } from "../../../typings/GalleryProps";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

export interface GalleryPaginationConfig {
    constPageSize: number;
    initPageSize: number;
    customPaginationEnabled: boolean;
    dynamicPageEnabled: boolean;
    dynamicPageSizeEnabled: boolean;
    isLimitBased: boolean;
    isVirtualScrolling: boolean;
    pagination: PaginationEnum;
    paginationKind: PaginationKind;
    pagingPosition: PagingPositionEnum;
    requestTotalCount: boolean;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfItems: boolean;
}

export type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}` | "custom";

export function galleryPaginationConfig(props: GalleryGateProps): GalleryPaginationConfig {
    const config: GalleryPaginationConfig = {
        constPageSize: props.pageSize,
        initPageSize: resolveInitPageSize(props),
        customPaginationEnabled: paginationKind(props) === "custom",
        dynamicPageEnabled: dynamicPageEnabled(props),
        dynamicPageSizeEnabled: dynamicPageSizeEnabled(props),
        isLimitBased: isLimitBased(props),
        isVirtualScrolling: props.pagination === "virtualScrolling",
        pagination: props.pagination,
        paginationKind: paginationKind(props),
        pagingPosition: props.pagingPosition,
        requestTotalCount: requestTotalCount(props),
        showPagingButtons: props.showPagingButtons,
        showNumberOfItems: props.showTotalCount
    };

    return Object.freeze(config);
}

/**
 * Resolves the initial page size for the first datasource fetch.
 * Returns 0 when `dynamicPageSize` is configured so that no rows are fetched
 * before the attribute value is available — the real limit is applied once
 * `DynamicPaginationFeature` syncs the attribute on setup.
 */
export function resolveInitPageSize(props: GalleryGateProps): number {
    if (props.dynamicPageSize !== undefined) {
        return 0;
    }
    return props.pageSize;
}

export function paginationKind(props: GalleryGateProps): PaginationKind {
    if (props.useCustomPagination) {
        return "custom";
    }

    return `${props.pagination}.${props.showPagingButtons}`;
}

function isLimitBased(props: GalleryGateProps): boolean {
    return props.pagination === "virtualScrolling" || props.pagination === "loadMore";
}

export function dynamicPageSizeEnabled(props: GalleryGateProps): boolean {
    return props.dynamicPageSize !== undefined;
}

export function dynamicPageEnabled(props: GalleryGateProps): boolean {
    return props.dynamicPage !== undefined;
}

function requestTotalCount(props: GalleryGateProps): boolean {
    return props.pagination === "buttons" || props.showTotalCount || props.totalCountValue !== undefined;
}
