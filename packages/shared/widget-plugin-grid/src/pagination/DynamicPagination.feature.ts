import {
    ComputedAtom,
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { autorun, reaction, untracked } from "mobx";
import { GridPageControl } from "../interfaces/GridPageControl";

type FeatureGateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    loadedRowsValue?: EditableValue<Big>;
};

export class DynamicPaginationFeature implements SetupComponent {
    id = "DynamicPaginationFeature";
    constructor(
        host: SetupComponentHost,
        private config: { dynamicPageSizeEnabled: boolean; dynamicPageEnabled: boolean; isLimitBased: boolean },
        private dynamicPage: ComputedAtom<number>,
        private dynamicPageSize: ComputedAtom<number>,
        private totalCount: ComputedAtom<number>,
        private currentPage: ComputedAtom<number>,
        private pageSize: ComputedAtom<number>,
        private loadedRows: ComputedAtom<number>,
        private gate: DerivedPropsGate<FeatureGateProps>,
        private service: GridPageControl
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        // Inbound: attribute value → page control
        // fireImmediately: true ensures externally-provided values are applied synchronously
        // during setup(), before the outbound autoruns below run. Without it the outbound
        // autoruns fire first (with constPageSize / currentPage=0) and overwrite the attr,
        // so the 250ms-delayed reaction would then read back the wrong (default) value.
        // The guards (pageSize <= 0 / page < 0) correctly no-op when no value is provided.
        if (this.config.dynamicPageSizeEnabled) {
            add(
                reaction(
                    () => this.dynamicPageSize.get(),
                    pageSize => {
                        if (pageSize <= 0) return;
                        this.service.setPageSize(pageSize);
                    },
                    { delay: 250, fireImmediately: true }
                )
            );
        }

        if (this.config.dynamicPageEnabled) {
            add(
                reaction(
                    () => this.dynamicPage.get(),
                    page => {
                        if (page < 0) return;
                        this.service.setPage(page);
                    },
                    { delay: 250, fireImmediately: true }
                )
            );
        }

        // Outbound: page control → attribute value
        // Always sync totalCount when attribute is configured
        add(
            autorun(() => {
                const count = this.totalCount.get();
                // totalCount is -1 when the datasource has not yet computed it (sentinel value).
                // Avoid writing the sentinel to the attribute.
                if (count < 0) return;
                this.service.setTotalCount(count);
            })
        );

        // Sync current page and page size to attributes when enabled (all pagination modes).
        // Use untracked() to read the gate for the attr reference so the autorun only
        // re-runs when the computed page/size value changes — not on every setProps() call.
        // Without untracked, a new props reference from setProps() would re-trigger the
        // autorun and write the stale page value back, clobbering user-initiated attr writes.
        if (this.config.dynamicPageEnabled) {
            add(
                autorun(() => {
                    const page = this.currentPage.get();
                    const attr = untracked(() => this.gate.props.dynamicPage);
                    if (!attr || attr.readOnly) return;
                    // For offset-based pagination, currentPage is 0-based internally; store as 1-based in the attribute.
                    // For limit-based pagination (virtual scroll / loadMore), currentPage is already a loaded-page
                    // count starting at 1, so no adjustment is needed.
                    attr.setValue(new Big(this.config.isLimitBased ? page : page + 1));
                })
            );
        }

        if (this.config.dynamicPageSizeEnabled) {
            add(
                autorun(() => {
                    const size = this.pageSize.get();
                    const attr = untracked(() => this.gate.props.dynamicPageSize);
                    if (!attr || attr.readOnly) return;
                    attr.setValue(new Big(size));
                })
            );
        }

        // Sync loaded rows when attribute is configured (virtual/loadMore)
        add(
            autorun(() => {
                const count = this.loadedRows.get();
                if (count < 0) return;
                this.service.setLoadedRows?.(count);
            })
        );

        return disposeAll;
    }
}
