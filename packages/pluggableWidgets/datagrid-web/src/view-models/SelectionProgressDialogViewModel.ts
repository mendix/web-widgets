import { SelectAllService, TaskProgressService } from "@mendix/widget-plugin-grid/main";
import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { DynamicValue } from "mendix";
import { action, makeAutoObservable, reaction } from "mobx";

interface DynamicProps {
    selectAllRowsLabel?: DynamicValue<string>;
    cancelSelectionLabel?: DynamicValue<string>;
}

export class SelectionProgressDialogViewModel implements SetupComponent {
    /**
     * This state is synced with progressStore, but with short delay to
     * avoid UI flickering.
     */
    private dialogOpen = false;
    private timerId: ReturnType<typeof setTimeout> | undefined;
    private readonly dialogDelayMs = 1500;

    constructor(
        host: SetupComponentHost,
        private readonly gate: DerivedPropsGate<DynamicProps>,
        private readonly progress: TaskProgressService,
        private readonly selectService: SelectAllService
    ) {
        host.add(this);
        type PrivateMembers = "setDialogOpen";
        makeAutoObservable<this, PrivateMembers>(this, { setDialogOpen: action });
    }

    private setDialogOpen(value: boolean): void {
        this.dialogOpen = value;
    }

    get isOpen(): boolean {
        return this.dialogOpen;
    }

    get loaded(): number {
        return this.progress.loaded;
    }

    get total(): number {
        return this.progress.total;
    }

    get selectingAllLabel(): string {
        return this.gate.props.selectAllRowsLabel?.value ?? "Selecting all items...";
    }

    get cancelSelectionLabel(): string {
        return this.gate.props.cancelSelectionLabel?.value ?? "Cancel selection";
    }

    setup(): () => void {
        return reaction(
            () => this.progress.inProgress,
            inProgress => {
                if (inProgress) {
                    // Delay showing dialog to avoid flickering for fast operations
                    this.timerId = setTimeout(() => {
                        this.setDialogOpen(true);
                        this.timerId = undefined;
                    }, this.dialogDelayMs);
                } else {
                    this.setDialogOpen(false);
                    clearTimeout(this.timerId);
                }
            }
        );
    }

    onCancel(): void {
        this.selectService.abort();
    }
}
