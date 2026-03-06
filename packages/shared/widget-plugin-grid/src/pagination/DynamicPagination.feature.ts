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

type DynamicPaginationConfig = {
    isLimitBased: boolean;
    dynamicPageSizeEnabled: boolean;
    dynamicPageEnabled: boolean;
};

type DynamicPaginationGateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    loadedRowsValue?: EditableValue<Big>;
};

export class DynamicPaginationFeature implements SetupComponent {
    id = "DynamicPaginationFeature";
    constructor(
        host: SetupComponentHost,
        private config: DynamicPaginationConfig,
        private dynamicPage: ComputedAtom<number>,
        private dynamicPageSize: ComputedAtom<number>,
        private totalCount: ComputedAtom<number>,
        private currentPage: ComputedAtom<number>,
        private pageSize: ComputedAtom<number>,
        private loadedRows: ComputedAtom<number>,
        private gate: DerivedPropsGate<DynamicPaginationGateProps>,
        private service: GridPageControl
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        // inbound reactions (prop -> service)
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

        add(
            autorun(() => {
                this.service.setTotalCount(this.totalCount.get());
            })
        );

        // outbound autoruns (service/query state -> props)
        if (this.config.dynamicPageEnabled) {
            add(
                autorun(() => {
                    const attr = this.gate.props.dynamicPage;
                    if (!attr || attr.readOnly) return;
                    const val = this.currentPage.get();
                    const pageValue = this.config.isLimitBased ? val : val + 1;
                    attr.setValue(new Big(pageValue));
                })
            );
        }

        if (this.config.dynamicPageSizeEnabled) {
            add(
                autorun(() => {
                    const attr = this.gate.props.dynamicPageSize;
                    if (!attr || attr.readOnly) return;
                    attr.setValue(new Big(this.pageSize.get()));
                })
            );
        }

        add(
            autorun(() => {
                const attr = this.gate.props.totalCountValue;
                if (!attr || attr.readOnly) return;
                attr.setValue(new Big(this.totalCount.get()));
            })
        );

        add(
            autorun(() => {
                const attr = this.gate.props.loadedRowsValue;
                if (!attr || attr.readOnly) return;
                const rows = this.loadedRows.get();
                if (rows < 0) return;
                attr.setValue(new Big(rows));
            })
        );

        return disposeAll;
    }
}
