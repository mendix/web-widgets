import { boundPageSize } from "@mendix/widget-plugin-grid/main";
import { ComputedAtom, DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";
import { ReactNode } from "react";

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

/** Atom for the dynamic page size. */
export function dynamicPageSizeAtom(
    gate: DerivedPropsGate<{ dynamicPageSize?: { value?: Big } }>
): ComputedAtom<number> {
    return boundPageSize(() => gate.props.dynamicPageSize?.value?.toNumber() ?? -1);
}

export function customPaginationAtom(
    gate: DerivedPropsGate<{ customPagination?: ReactNode }>
): ComputedAtom<ReactNode> {
    return computed(() => gate.props.customPagination);
}
