import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { SelectionMultiValue, SelectionSingleValue } from "mendix";
import { action, makeAutoObservable } from "mobx";
import { QueryController } from "../query/query-controller";

type Gate = DerivedPropsGate<{ itemSelection?: SelectionMultiValue | SelectionSingleValue }>;

interface SelectAllControllerSpec {
    gate: Gate;
    query: QueryController;
    bufferSize: number;
}

// interface SelectAllControllerEvents {
//     /** Emitted once when action is started. */
//     loadstart: (pe: ProgressEvent) => void;
//     /** Emitted every time new page is loaded. */
//     progress: (pe: ProgressEvent) => void;
//     /** Emitted if abort method is called. */
//     abort: (pe: ProgressEvent) => void;
//     /** Emitted when no more data is available. */
//     end: (pe: ProgressEvent) => void;
//     /** Emitted at the end of the request. */
//     loadend: (pe: ProgressEvent) => void;
// }

type SelectAllEventType = "loadstart" | "progress" | "abort" | "loadend";

export class SelectAllController extends EventTarget implements ReactiveController {
    private readonly gate: Gate;
    private readonly query: QueryController;
    // private readonly progressStore: ProgressStore;
    // private readonly bufferSize: number;
    private abortController?: AbortController;
    private locked = false;
    readonly pageSize: number = 2;

    constructor(host: ReactiveControllerHost, spec: SelectAllControllerSpec) {
        super();
        host.addController(this);
        this.gate = spec.gate;
        this.query = spec.query;
        // this.pageSize = Math.max(this.pageSize, spec.bufferSize);

        type PrivateMembers = "setIsLocked";
        makeAutoObservable<this, PrivateMembers>(this, { setIsLocked: action });
    }

    setup(): () => void {
        // this.addEventListener("loadend", (event) => {event.target.});
        return () => this.abort();
    }

    addEventListener(
        type: SelectAllEventType,
        callback: (pe: ProgressEvent<SelectAllController>) => void,
        options?: AddEventListenerOptions | boolean
    ): void {
        super.addEventListener(type, callback, options);
    }

    // get isMultiSelection(): boolean {
    //     return this.gate.props.itemSelection?.type === "Multi";
    // }

    // get hasSelection(): boolean {
    //     const selection = this.gate.props.itemSelection?.selection;
    //     if (!selection) return false;
    //     return Array.isArray(selection) ? selection.length > 0 : true;
    // }

    // get selectionCount(): number {
    //     const selection = this.gate.props.itemSelection?.selection;
    //     if (!selection) return 0;
    //     return Array.isArray(selection) ? selection.length : 1;
    // }

    // get canSelectAllPages(): boolean {
    //     return this.isMultiSelection && this.query.hasMoreItems;
    // }

    get selection(): SelectionMultiValue | undefined {
        const selection = this.gate.props.itemSelection;
        return selection?.type === "Multi" ? selection : undefined;
    }

    get canExecute(): boolean {
        return this.selection?.type === "Multi" && !this.locked;
    }

    get isExecuting(): boolean {
        return this.locked;
    }

    private setIsLocked(value: boolean): void {
        this.locked = value;
    }

    private beforeRunChecks(): boolean {
        const selection = this.gate.props.itemSelection;
        if (selection?.type !== "Single") {
            console.debug("SelectAllController: action can't be executed when selection is 'Single'.");
            return false;
        }

        if (selection?.type === undefined) {
            console.debug("SelectAllController: selection is undefined. Check widget selection setting.");
            return false;
        }

        if (this.locked) {
            console.debug("SelectAllController: action is already executing.");
            return false;
        }
        return true;
    }

    // private createProgressEvent(type: string, loaded: number): ProgressEvent {
    //     return new ProgressEvent(type, {
    //         lengthComputable: typeof this.query.totalCount === "number",
    //         loaded: this.loaded,
    //         total: this.totalCount
    //     });
    // }

    async selectAllPages(): Promise<void> {
        if (!this.beforeRunChecks()) {
            return;
        }

        this.setIsLocked(true);

        const { offset: initOffset, limit: initLimit } = this.query;
        const hasTotal = typeof this.query.totalCount === "number";
        const totalCount = this.query.totalCount ?? 0;
        let loaded = 0;
        let offset = 0;
        const pe = (type: SelectAllEventType): ProgressEvent =>
            new ProgressEvent(type, { loaded, total: totalCount, lengthComputable: hasTotal });

        try {
            this.abortController = new AbortController();
            this.dispatchEvent(pe("loadstart"));
            this.selection?.setKeepSelection(() => true);
            let loading = true;
            while (loading) {
                await this.query.fetchPage({
                    limit: this.pageSize,
                    offset,
                    signal: this.abortController.signal
                });
                const loadedItems = this.query.items ?? [];
                const merged = (this.selection?.selection ?? []).concat(loadedItems);

                loaded += loadedItems.length;
                offset += this.pageSize;
                this.selection?.setSelection(merged);
                this.dispatchEvent(pe("progress"));
                loading = !this.abortController.signal.aborted && this.query.hasMoreItems;
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("SelectAllController: error occurred while executing action.", error);
            }
        } finally {
            this.dispatchEvent(pe("loadend"));
            this.query.setOffset(initOffset);
            this.query.setLimit(initLimit);
            this.locked = false;
            this.abortController = undefined;
        }
    }

    clearSelection(): void {
        if (this.locked) {
            console.debug("SelectAllController: can't clear selection while executing.");
            return;
        }
        this.selection?.setSelection([]);
    }

    abort(): void {
        this.abortController?.abort();
        this.dispatchEvent(new ProgressEvent("abort"));
    }
}
