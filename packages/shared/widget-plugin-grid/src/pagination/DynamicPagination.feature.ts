import {
    ComputedAtom,
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { autorun, reaction } from "mobx";
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
        private config: { dynamicPageSizeEnabled: boolean; dynamicPageEnabled: boolean },
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
        if (this.config.dynamicPageSizeEnabled) {
            add(
                reaction(
                    () => this.dynamicPageSize.get(),
                    pageSize => {
                        if (pageSize < 0) return;
                        this.service.setPageSize(pageSize);
                    },
                    { delay: 250 }
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
                    { delay: 250 }
                )
            );
        }

        // Outbound: page control → attribute value
        // Always sync totalCount when attribute is configured
        add(
            autorun(() => {
                this.service.setTotalCount(this.totalCount.get());
            })
        );

        // Sync current page and page size to attributes when enabled (all pagination modes)
        if (this.config.dynamicPageEnabled) {
            add(
                autorun(() => {
                    const page = this.currentPage.get();
                    const attr = this.gate.props.dynamicPage;
                    if (!attr || attr.readOnly) return;
                    // currentPage is 0-based internally; store 1-based in attribute
                    attr.setValue(new Big(page + 1));
                })
            );
        }

        if (this.config.dynamicPageSizeEnabled) {
            add(
                autorun(() => {
                    const size = this.pageSize.get();
                    const attr = this.gate.props.dynamicPageSize;
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
