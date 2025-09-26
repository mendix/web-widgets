import { QueryController } from "../query/query-controller";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { SelectionMultiValue, SelectionSingleValue } from "mendix";

type Gate = DerivedPropsGate<{ itemSelection?: SelectionMultiValue | SelectionSingleValue }>;

export interface ISelectAllProgressStore {
    selecting: boolean;
    lengthComputable: boolean;
    loaded: number;
    total: number;
    cancelled: boolean;
    onloadstart: (total: number) => void;
    onprogress: (loaded: number) => void;
    onloadend: () => void;
    oncancel: () => void;
    progress: number;
    displayProgress: string;
}

interface MultiPageSelectionControllerSpec {
    gate: Gate;
    query: QueryController;
    progressStore: ISelectAllProgressStore;
    bufferSize: number;
}

export class MultiPageSelectionController implements ReactiveController {
    private readonly gate: Gate;
    private readonly query: QueryController;
    private readonly progressStore: ISelectAllProgressStore;
    private readonly bufferSize: number;
    private abortController?: AbortController;
    private locked = false;

    constructor(host: ReactiveControllerHost, spec: MultiPageSelectionControllerSpec) {
        host.addController(this);
        this.gate = spec.gate;
        this.query = spec.query;
        this.progressStore = spec.progressStore;
        this.bufferSize = spec.bufferSize;
    }

    setup(): () => void {
        // No specific setup needed for now
        return () => {
            // Cleanup
            this.abort();
        };
    }

    get isRunning(): boolean {
        return this.locked;
    }

    get isMultiSelection(): boolean {
        return this.gate.props.itemSelection?.type === "Multi";
    }

    get hasSelection(): boolean {
        const selection = this.gate.props.itemSelection?.selection;
        if (!selection) return false;
        return Array.isArray(selection) ? selection.length > 0 : true;
    }

    get selectionCount(): number {
        const selection = this.gate.props.itemSelection?.selection;
        if (!selection) return 0;
        return Array.isArray(selection) ? selection.length : 1;
    }

    get canSelectAllPages(): boolean {
        return this.isMultiSelection && this.query.hasMoreItems;
    }

    async selectAllPages(): Promise<boolean> {
        if (this.locked) {
            return false;
        }

        if (!this.isMultiSelection) {
            return false;
        }

        if (!this.query.hasMoreItems) {
            return false;
        }

        this.locked = true;
        let success = false;

        try {
            const originalOffset = this.query.offset;
            const originalLimit = this.query.limit;

            this.progressStore.onloadstart(this.query.totalCount ?? 0);
            this.progressStore.lengthComputable = false;
            this.abortController = new AbortController();

            const pageLimit = Math.max(1, this.bufferSize || this.query.limit || 25);
            let offset = 0;
            let loaded = 0;

            try {
                this.gate.props.itemSelection?.setKeepSelection(() => true);
                while (!this.abortController.signal.aborted) {
                    await this.query.fetchPage({
                        limit: pageLimit,
                        offset,
                        signal: this.abortController.signal
                    });
                    loaded += this.query.items?.length ?? 0;

                    // Accumulate selection by spreading existing and new items
                    const currentSelection = this.gate.props.itemSelection?.selection;
                    const existingItems = Array.isArray(currentSelection) ? currentSelection : [];
                    const newItems = this.query.items ?? [];
                    const combinedSelection = [...existingItems, ...newItems];

                    this.gate.props.itemSelection?.setSelection(combinedSelection as any);
                    offset += pageLimit;
                    this.progressStore.onprogress(loaded);
                    if (!this.query.hasMoreItems) break;
                }

                if (this.abortController.signal.aborted) {
                    return false;
                }

                // Restore original pagination
                this.query.setLimit(originalLimit);
                this.query.setOffset(originalOffset);
                success = true;
            } finally {
                this.gate.props.itemSelection?.setKeepSelection(undefined);
            }
        } catch (error) {
            // Selection failed or was aborted
            console.error("MultiPageSelectionController: Selection failed", error);
        } finally {
            this.progressStore.onloadend();
            this.locked = false;
            this.abortController = undefined;
        }

        return success;
    }

    clearAllPages(): boolean {
        if (!this.isMultiSelection) {
            return false;
        }
        this.gate.props.itemSelection?.setSelection([] as any);
        return true;
    }

    abort(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.progressStore.oncancel();
            this.locked = false;
        }
    }
}
