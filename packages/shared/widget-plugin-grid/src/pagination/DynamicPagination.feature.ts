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
        private loadedRows: ComputedAtom<number>,
        private gate: DerivedPropsGate<FeatureGateProps>,
        private service: GridPageControl
    ) {
        host.add(this);
    }

    setup(): () => void {
        const [add, disposeAll] = disposeBatch();

        if (this.config.dynamicPageSizeEnabled) {
            add(this.syncPageSizeFromAttribute());
        }

        if (this.config.dynamicPageEnabled) {
            add(this.syncPageFromAttribute());
            add(this.syncCurrentPageToAttribute());
        }

        add(this.syncTotalCountToAttribute());
        add(this.syncLoadedRowsToAttribute());

        return disposeAll;
    }

    /**
     * Syncs dynamicPageSize attribute changes to internal pagination state.
     * Debounces rapid changes and applies initial value immediately during setup.
     */
    private syncPageSizeFromAttribute(): () => void {
        return reaction(
            () => this.dynamicPageSize.get(),
            pageSize => {
                if (pageSize <= 0) return;
                this.service.setPageSize(pageSize);
            },
            { delay: 250, fireImmediately: true }
        );
    }

    /**
     * Syncs dynamicPage attribute changes to internal pagination state.
     * For limit-based pagination, skips initial sync to avoid conflicting with widget's base limit setup.
     */
    private syncPageFromAttribute(): () => void {
        return reaction(
            () => this.dynamicPage.get(),
            page => {
                if (page < 0) return;
                if (this.config.isLimitBased && page < 1) return;
                this.service.setPage(page);
            },
            {
                delay: 250,
                fireImmediately: !this.config.isLimitBased
            }
        );
    }

    /**
     * Syncs internal totalCount state to the totalCountValue attribute.
     * Skips sentinel value (-1) when datasource hasn't computed count yet.
     */
    private syncTotalCountToAttribute(): () => void {
        return autorun(() => {
            const count = this.totalCount.get();
            if (count < 0) return;
            this.service.setTotalCount(count);
        });
    }

    /**
     * Syncs internal currentPage state to the dynamicPage attribute.
     * Uses untracked() for attribute reference to prevent re-running on every setProps() call.
     * Converts 0-based internal page to 1-based attribute value for offset pagination.
     */
    private syncCurrentPageToAttribute(): () => void {
        return autorun(() => {
            const page = this.currentPage.get();
            const dynamicPage = untracked(() => this.gate.props.dynamicPage);
            if (!dynamicPage || dynamicPage.readOnly) return;
            dynamicPage.setValue(new Big(this.config.isLimitBased ? page : page + 1));
        });
    }

    /**
     * Syncs internal loadedRows state to the loadedRowsValue attribute.
     * Skips sentinel value (-1) when count isn't yet available.
     */
    private syncLoadedRowsToAttribute(): () => void {
        return autorun(() => {
            const count = this.loadedRows.get();
            if (count < 0) return;
            this.service.setLoadedRows?.(count);
        });
    }
}
