import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { action, computed } from "mobx";
import { ReactNode } from "react";
import { QueryService } from "../main";

/** Atom for the dynamic page index provided by the widget's props. */
export function dynamicPageAtom(
    gate: DerivedPropsGate<{ dynamicPage?: { value?: Big } }>,
    config: { isLimitBased: boolean }
): ComputedAtom<number> {
    return computed(() => {
        const page = gate.props.dynamicPage?.value?.toNumber() ?? -1;
        if (config.isLimitBased) {
            return Math.max(page, -1);
        }
        // Switch to zero-based index for offset-based pagination
        return Math.max(page - 1, -1);
    });
}

/**
 * Return observable atom holding page size.
 * Value -1 means no meaningful page size is set.
 */
export function dynamicPageSizeAtom(
    gate: DerivedPropsGate<{ dynamicPageSize?: { value?: Big } }>
): ComputedAtom<number> {
    return computed(() => {
        const pageSize = gate.props.dynamicPageSize?.value?.toNumber() ?? -1;
        return Math.max(pageSize, -1);
    });
}

/** Atom for custom pagination widgets. */
export function customPaginationAtom(
    gate: DerivedPropsGate<{ customPagination?: ReactNode }>
): ComputedAtom<ReactNode> {
    return computed(() => gate.props.customPagination);
}

/**
 * Atom that computes the current page based on query parameters.
 * @injectable
 * @remark
 * When pagination is limit-based, the atom value is the number
 * of loaded pages instead of the current page index.
 * In the case of offset-based pagination, the atom value is the zero-based page index.
 */
export function currentPageAtom(
    query: QueryService,
    pageSize: ComputedAtom<number>,
    config: { isLimitBased: boolean }
): ComputedAtom<number> {
    return computed(() => {
        const size = pageSize.get();
        const { limit, offset } = query;
        return Math.floor(config.isLimitBased ? limit / size : offset / size);
    });
}

/** Main atom for the page size. */
export function pageSizeAtom(store: { pageSize: number }): ComputedAtom<number> {
    return computed(() => store.pageSize);
}

export type SetPageAction = (value: ((prevPage: number) => number) | number) => void;

/** Main action to change page. */
export function createSetPageAction(
    query: QueryService,
    config: { isLimitBased: boolean },
    currentPage: ComputedAtom<number>,
    pageSize: ComputedAtom<number>
): SetPageAction {
    return action(function setPageAction(value): void {
        const newPage = typeof value === "function" ? value(currentPage.get()) : value;
        if (config.isLimitBased) {
            query.setLimit(newPage * pageSize.get());
        } else {
            query.setOffset(newPage * pageSize.get());
        }
    });
}

export type SetPageSizeAction = (newSize: number) => void;

/** Main action to change page size. */
export function createSetPageSizeAction(
    query: QueryService,
    config: { isLimitBased: boolean },
    currentPage: ComputedAtom<number>,
    pageSizeStore: { setPageSize: (n: number) => void },
    setPageAction: SetPageAction
): SetPageSizeAction {
    return action(function setPageSizeAction(newSize: number): void {
        const currentPageIndex = currentPage.get();

        // Update limit in case of offset-based pagination
        if (!config.isLimitBased) {
            query.setBaseLimit(newSize);
        }
        pageSizeStore.setPageSize(newSize);
        setPageAction(currentPageIndex);
    });
}
