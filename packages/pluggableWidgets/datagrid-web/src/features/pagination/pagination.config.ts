import { PaginationEnum, ShowPagingButtonsEnum } from "../../../typings/DatagridProps";
import { MainGateProps } from "../../../typings/MainGateProps";

export interface PaginationConfig {
    pagination: PaginationEnum;
    paginationKind: PaginationKind;
    showPagingButtons: ShowPagingButtonsEnum;
    showNumberOfRows: boolean;
    pageSize: number;
    isLimitBased: boolean;
    dynamicPageSizeEnabled: boolean;
    dynamicPageEnabled: boolean;
    customPaginationEnabled: boolean;
}

export type PaginationKind = `${PaginationEnum}.${ShowPagingButtonsEnum}` | "custom";

export function paginationConfig(props: MainGateProps): PaginationConfig {
    const config: PaginationConfig = {
        pagination: props.pagination,
        showPagingButtons: props.showPagingButtons,
        showNumberOfRows: props.showNumberOfRows,
        pageSize: props.pageSize,
        isLimitBased: isLimitBased(props),
        paginationKind: paginationKind(props),
        dynamicPageSizeEnabled: dynamicPageSizeEnabled(props),
        dynamicPageEnabled: dynamicPageEnabled(props),
        customPaginationEnabled: props.useCustomPagination
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
