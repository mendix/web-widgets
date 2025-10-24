import { SelectAllController } from "@mendix/widget-plugin-grid/selection";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/stores/SelectionCountStore";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { action, makeAutoObservable, reaction } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type DynamicProps = Pick<
    DatagridContainerProps,
    | "cancelSelectionLabel"
    | "selectAllTemplate"
    | "selectAllText"
    | "clearSelectionCaption"
    | "itemSelection"
    | "selectedCountTemplatePlural"
    | "selectedCountTemplateSingular"
    | "datasource"
    | "allSelectedText"
    | "enableSelectAll"
>;

export class SelectAllBarViewModel implements ReactiveController {
    private barVisible = false;
    private clearVisible = false;
    private readonly enableSelectAll: boolean;

    pending = false;

    constructor(
        host: ReactiveControllerHost,
        private readonly gate: DerivedPropsGate<DynamicProps>,
        private readonly selectAllController: SelectAllController,
        private readonly count = new SelectionCountStore(gate)
    ) {
        host.addController(this);
        type PrivateMembers = "setClearVisible" | "setPending" | "hideBar" | "showBar";
        makeAutoObservable<this, PrivateMembers>(this, {
            setClearVisible: action,
            setPending: action,
            hideBar: action,
            showBar: action
        });
        this.enableSelectAll = gate.props.enableSelectAll;
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
        return this.gate.props.datasource.totalCount ?? 0;
    }

    private get selectAllFormat(): string {
        return this.gate.props.selectAllTemplate?.value ?? "select.all.n.items";
    }

    private get selectAllText(): string {
        return this.gate.props.selectAllText?.value ?? "select.all.items";
    }

    private get allSelectedText(): string {
        const str = this.gate.props.allSelectedText?.value ?? "all.selected";
        return str.replace("%d", `${this.count.selectedCount}`);
    }

    private get isCurrentPageSelected(): boolean {
        const selection = this.gate.props.itemSelection;

        if (!selection || selection.type === "Single") return false;

        const pageIds = new Set(this.gate.props.datasource.items?.map(item => item.id) ?? []);
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
        return this.gate.props.clearSelectionCaption?.value ?? "clear.selection.caption";
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
        this.selectAllController.clearSelection();
    }

    async onSelectAll(): Promise<void> {
        this.setPending(true);
        try {
            const { success } = await this.selectAllController.selectAllPages();
            this.setClearVisible(success);
        } finally {
            this.setPending(false);
        }
    }
}
