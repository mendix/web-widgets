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
    return props.dynamicPageSize !== undefined && !isLimitBased(props);
}

export function dynamicPageEnabled(props: MainGateProps): boolean {
    return props.dynamicPage !== undefined && !isLimitBased(props);
}

function isLimitBased(props: MainGateProps): boolean {
    return props.pagination === "virtualScrolling" || props.pagination === "loadMore";
}

function requestTotalCount(props: MainGateProps): boolean {
    return props.pagination === "buttons" || props.showNumberOfRows;
}
