import { PaginationEnum, PagingPositionEnum, ShowPagingButtonsEnum } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";

export interface PaginationConfig {
    pagination: PaginationEnum;
    pagingPosition: PagingPositionEnum;
    paginationKind: PaginationKind;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    constPageSize: number;
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

export function paginationKind(props: MainGateProps): PaginationKind {
    if (props.useCustomPagination) {
        return "custom";
    }

    return `${props.pagination}.${props.showPagingButtons}`;
}

export function dynamicPageSizeEnabled(props: MainGateProps): boolean {
    // previously disabled for limit-based modes, but we now want the
    // attribute available everywhere (buttons, virtual scroll, load more)
    return props.dynamicPageSize !== undefined;
}

export function dynamicPageEnabled(props: MainGateProps): boolean {
    // always allow dynamic page attribute regardless of pagination kind
    return props.dynamicPage !== undefined;
}

export function isLimitBased(props: MainGateProps): boolean {
    return props.pagination === "virtualScrolling" || props.pagination === "loadMore";
}

export function requestTotalCount(props: MainGateProps): boolean {
    // always ask for total count when user mapped an attribute, even in
    // virtual or load-more modes.
    if (props.totalCountValue !== undefined) {
        return true;
    }
    return props.pagination === "buttons" || props.showNumberOfRows;
}
