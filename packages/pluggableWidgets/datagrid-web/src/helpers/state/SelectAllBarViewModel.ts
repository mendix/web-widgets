import { SelectAllController } from "@mendix/widget-plugin-grid/selection";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/stores/SelectionCountStore";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { autorun, makeAutoObservable } from "mobx";
import { DatagridContainerProps } from "../../../typings/DatagridProps";

type Props = Pick<
    DatagridContainerProps,
    | "cancelSelectionLabel"
    | "selectAllTemplate"
    | "selectRemainingTemplate"
    | "clearSelectionCaption"
    | "itemSelection"
    | "selectedCountTemplatePlural"
    | "selectedCountTemplateSingular"
    | "datasource"
>;

type Gate = DerivedPropsGate<Props>;

export class SelectAllBarViewModel implements ReactiveController {
    showClear = false;

    constructor(
        host: ReactiveControllerHost,
        private gate: Gate,
        private selectAllController: SelectAllController,
        private count = new SelectionCountStore(gate)
    ) {
        host.addController(this);
        makeAutoObservable(this);
    }

    private setShowClear(value: boolean): void {
        this.showClear = value;
    }

    private get total(): number {
        return this.gate.props.datasource.totalCount ?? 0;
    }

    private get selectAllFormat(): string {
        return this.gate.props.selectAllTemplate?.value ?? "select.all.items";
    }

    private get selectRemainingText(): string {
        return this.gate.props.selectRemainingTemplate?.value ?? "select.remaining.items";
    }

    private get isSelectionEmpty(): boolean {
        return this.count.selectedCount === 0;
    }

    get selectAllLabel(): string {
        if (this.total > 0) return this.selectAllFormat.replace("%d", `${this.total}`);
        return this.selectRemainingText;
    }

    get clearSelectionLabel(): string {
        return this.gate.props.clearSelectionCaption?.value ?? "clear.selection.caption";
    }

    get selectionCountText(): string {
        return this.count.selectedCountText;
    }

    get barVisible(): boolean {
        return this.count.selectedCountText !== "";
    }

    get clearVisible(): boolean {
        if (this.showClear) return true;
        if (this.total > 0) return this.total === this.count.selectedCount;
        return false;
    }

    get selectAllVisible(): boolean {
        // Note: order of checks matter.
        if (this.showClear) return false;
        if (this.total > 0) return this.total > this.count.selectedCount;
        return this.gate.props.datasource.hasMoreItems ?? false;
    }

    setup(): () => void {
        return autorun(() => {
            if (this.isSelectionEmpty) {
                this.setShowClear(false);
            }
        });
    }

    onClear(): void {
        this.selectAllController.clearSelection();
        this.setShowClear(false);
    }

    async onSelectAll(): Promise<void> {
        const { success } = await this.selectAllController.selectAllPages();
        this.setShowClear(success);
    }
}
