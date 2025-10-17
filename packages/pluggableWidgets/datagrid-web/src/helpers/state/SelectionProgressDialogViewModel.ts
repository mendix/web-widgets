import { SelectAllController } from "@mendix/widget-plugin-grid/selection";
import { ProgressStore } from "@mendix/widget-plugin-grid/stores/ProgressStore";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { DynamicValue } from "mendix";
import { action, makeAutoObservable, reaction } from "mobx";

type Gate = DerivedPropsGate<{
    selectingAllLabel?: DynamicValue<string>;
    cancelSelectionLabel?: DynamicValue<string>;
}>;

export class SelectionProgressDialogViewModel implements ReactiveController {
    /**
     * This state is synced with progressStore, but with short delay to
     * avoid UI flickering.
     */
    private dialogOpen = false;

    #gate: Gate;
    #progressStore: ProgressStore;
    #selectAllController: SelectAllController;
    #timerId: ReturnType<typeof setTimeout> | undefined;

    constructor(
        host: ReactiveControllerHost,
        gate: Gate,
        progressStore: ProgressStore,
        selectAllController: SelectAllController
    ) {
        host.addController(this);
        type PrivateMembers = "setDialogOpen";
        makeAutoObservable<this, PrivateMembers>(this, { setDialogOpen: action });
        this.#gate = gate;
        this.#progressStore = progressStore;
        this.#selectAllController = selectAllController;
    }

    private setDialogOpen(value: boolean): void {
        this.dialogOpen = value;
    }

    get isOpen(): boolean {
        return this.dialogOpen;
    }

    get progress(): number {
        return this.#progressStore.loaded;
    }

    get total(): number {
        return this.#progressStore.total;
    }

    get selectingAllLabel(): string {
        return this.#gate.props.selectingAllLabel?.value ?? "Selecting all items...";
    }

    get cancelSelectionLabel(): string {
        return this.#gate.props.cancelSelectionLabel?.value ?? "Cancel selection";
    }

    setup(): () => void {
        return reaction(
            () => this.#progressStore.inProgress,
            inProgress => {
                if (inProgress) {
                    // Delay showing dialog for 2 second
                    this.#timerId = setTimeout(() => {
                        this.setDialogOpen(true);
                        this.#timerId = undefined;
                    }, 1500);
                } else {
                    this.setDialogOpen(false);
                    clearTimeout(this.#timerId);
                }
            }
        );
    }

    onCancel(): void {
        this.#selectAllController.abort();
    }
}
