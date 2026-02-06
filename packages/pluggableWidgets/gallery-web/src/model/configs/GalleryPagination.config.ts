import { PaginationEnum, PagingPositionEnum, ShowPagingButtonsEnum } from "../../../typings/GalleryProps";
import { GalleryGateProps } from "../../typings/GalleryGateProps";

export interface GalleryPaginationConfig {
    constPageSize: number;
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
    return props.dynamicPageSize !== undefined && !isLimitBased(props);
}

export function dynamicPageEnabled(props: GalleryGateProps): boolean {
    return props.dynamicPage !== undefined && !isLimitBased(props);
}

function requestTotalCount(props: GalleryGateProps): boolean {
    return props.pagination === "buttons" || props.showTotalCount;
}
