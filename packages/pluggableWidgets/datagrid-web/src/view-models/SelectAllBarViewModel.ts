import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { action, makeAutoObservable, reaction } from "mobx";
import { DatagridContainerProps } from "../../typings/DatagridProps";

type DynamicProps = Pick<
    DatagridContainerProps,
    "selectAllTemplate" | "selectAllText" | "itemSelection" | "datasource" | "allSelectedText"
>;

interface SelectService {
    selectAllPages(): Promise<{ success: boolean }> | { success: boolean };
    clearSelection(): void;
}

interface CounterService {
    selectedCount: number;
    selectedCountText: string;
    clearButtonLabel: string;
}

/** @injectable */
export class SelectAllBarViewModel implements SetupComponent {
    private barVisible = false;
    private clearVisible = false;

    pending = false;

    constructor(
        host: SetupComponentHost,
        private readonly gate: DerivedPropsGate<DynamicProps>,
        private readonly selectService: SelectService,
        private readonly count: CounterService,
        private readonly enableSelectAll: boolean
    ) {
        host.add(this);
        type PrivateMembers = "setClearVisible" | "setPending" | "hideBar" | "showBar";
        makeAutoObservable<this, PrivateMembers>(this, {
            setClearVisible: action,
            setPending: action,
            hideBar: action,
            showBar: action
        });
    }

    private get props(): DynamicProps {
        return this.gate.props;
    }

    private setClearVisible(value: boolean): void {
        this.clearVisible = value;
    }

    private setPending(value: boolean): void {
        this.pending = value;
    }

    private hideBar(): void {
        this.barVisible = false;
        this.clearVisible = false;
    }

    private showBar(): void {
        this.barVisible = true;
    }

    private get total(): number {
        return this.props.datasource.totalCount ?? 0;
    }

    private get selectAllFormat(): string {
        return this.props.selectAllTemplate?.value ?? "select.all.n.items";
    }

    private get selectAllText(): string {
        return this.props.selectAllText?.value ?? "select.all.items";
    }

    private get allSelectedText(): string {
        const str = this.props.allSelectedText?.value ?? "all.selected";
        return str.replace("%d", `${this.count.selectedCount}`);
    }

    private get isCurrentPageSelected(): boolean {
        const selection = this.props.itemSelection;

        if (!selection || selection.type === "Single") return false;

        const pageIds = new Set(this.props.datasource.items?.map(item => item.id) ?? []);
        const selectionSubArray = selection.selection.filter(item => pageIds.has(item.id));
        return selectionSubArray.length === pageIds.size && pageIds.size > 0;
    }

    private get isAllItemsSelected(): boolean {
        if (this.total > 0) return this.total === this.count.selectedCount;

        const { offset, limit, items = [], hasMoreItems } = this.gate.props.datasource;
        const noMoreItems = typeof hasMoreItems === "boolean" && hasMoreItems === false;
        const fullyLoaded = offset === 0 && limit >= items.length;

        return fullyLoaded && noMoreItems && items.length === this.count.selectedCount;
    }

    get selectAllLabel(): string {
        if (this.total > 0) return this.selectAllFormat.replace("%d", `${this.total}`);
        return this.selectAllText;
    }

    get clearSelectionLabel(): string {
        return this.count.clearButtonLabel;
    }

    get selectionStatus(): string {
        if (this.isAllItemsSelected) return this.allSelectedText;
        return this.count.selectedCountText;
    }

    get isBarVisible(): boolean {
        return this.enableSelectAll && this.barVisible;
    }

    get isClearVisible(): boolean {
        return this.clearVisible;
    }

    get isSelectAllVisible(): boolean {
        return !this.clearVisible;
    }

    get isSelectAllDisabled(): boolean {
        return this.pending;
    }

    setup(): (() => void) | void {
        if (!this.enableSelectAll) return;

        return reaction(
            () => this.isCurrentPageSelected,
            isCurrentPageSelected => {
                if (isCurrentPageSelected === false) {
                    this.hideBar();
                } else if (this.isAllItemsSelected === false) {
                    this.showBar();
                }
            }
        );
    }

    onClear(): void {
        this.selectService.clearSelection();
    }

    async onSelectAll(): Promise<void> {
        this.setPending(true);
        try {
            const { success } = await this.selectService.selectAllPages();
            this.setClearVisible(success);
        } finally {
            this.setPending(false);
        }
    }
}
