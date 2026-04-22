import {
    ComputedAtom,
    DerivedPropsGate,
    disposeBatch,
    SetupComponent,
    SetupComponentHost
} from "@mendix/widget-plugin-mobx-kit/main";
import { Big } from "big.js";
import { EditableValue } from "mendix";
import { reaction } from "mobx";
import { GridPageControl } from "../interfaces/GridPageControl";

type FeatureGateProps = {
    dynamicPage?: EditableValue<Big>;
    dynamicPageSize?: EditableValue<Big>;
    totalCountValue?: EditableValue<Big>;
    dynamicItemCount?: EditableValue<Big>;
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
        private itemCount: ComputedAtom<number>,
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
        add(this.syncItemCountToAttribute());

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
            { name: "[@reaction] syncPageSizeFromAttribute", delay: 250, fireImmediately: true }
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
                name: "[@reaction] syncPageFromAttribute",
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
        return reaction(
            () => this.totalCount.get(),
            count => {
                if (count < 0) return;
                this.service.setTotalCount(count);
            },
            { name: "[@reaction] syncTotalCountToAttribute", fireImmediately: true }
        );
    }

    /**
     * Syncs internal currentPage state to the dynamicPage attribute.
     * Converts 0-based internal page to 1-based attribute value for offset pagination.
     */
    private syncCurrentPageToAttribute(): () => void {
        return reaction(
            () => this.currentPage.get(),
            page => {
                const dynamicPage = this.gate.props.dynamicPage;
                if (!dynamicPage || dynamicPage.readOnly) return;
                dynamicPage.setValue(new Big(this.config.isLimitBased ? page : page + 1));
            },
            { name: "[@reaction] syncCurrentPageToAttribute", fireImmediately: true }
        );
    }

    /**
     * Syncs internal itemCount state to the dynamicItemCount attribute.
     * Skips sentinel value (-1) when count isn't yet available.
     */
    private syncItemCountToAttribute(): () => void {
        return reaction(
            () => this.itemCount.get(),
            count => {
                if (count < 0) return;
                this.service.setItemCount?.(count);
            },
            { name: "[@reaction] syncItemCountToAttribute", fireImmediately: true }
        );
    }
}
