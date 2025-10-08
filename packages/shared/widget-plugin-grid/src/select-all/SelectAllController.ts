import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { action, computed, makeObservable, observable } from "mobx";
import { QueryController } from "../query/query-controller";

type Gate = DerivedPropsGate<{ itemSelection?: SelectionMultiValue | SelectionSingleValue }>;

interface SelectAllControllerSpec {
    gate: Gate;
    query: QueryController;
    pageSize: number;
}

type SelectAllEventType = "loadstart" | "progress" | "abort" | "loadend";

export class SelectAllController implements ReactiveController {
    private readonly gate: Gate;
    private readonly query: QueryController;
    private abortController?: AbortController;
    private locked = false;
    readonly pageSize: number = 500;
    private readonly emitter = new EventTarget();

    constructor(host: ReactiveControllerHost, spec: SelectAllControllerSpec) {
        host.addController(this);
        this.gate = spec.gate;
        this.query = spec.query;

        type PrivateMembers = "setIsLocked" | "locked";
        makeObservable<this, PrivateMembers>(this, {
            setIsLocked: action,
            canExecute: computed,
            isExecuting: computed,
            locked: observable,
            selectAllPages: action,
            clearSelection: action,
            abort: action
        });
    }

    setup(): () => void {
        return () => this.abort();
    }

    on(type: SelectAllEventType, listener: (pe: ProgressEvent) => void): void {
        this.emitter.addEventListener(type, listener);
    }

    off(type: SelectAllEventType, listener: (pe: ProgressEvent) => void): void {
        this.emitter.removeEventListener(type, listener);
    }

    /**
     * @throws if selection is undefined or single
     */
    selection(): SelectionMultiValue {
        const selection = this.gate.props.itemSelection;
        if (selection === undefined) throw new Error("SelectAllController: selection is undefined.");
        if (selection.type === "Single") throw new Error("SelectAllController: single selection is not supported.");
        return selection;
    }

    get canExecute(): boolean {
        return this.gate.props.itemSelection?.type === "Multi" && !this.locked;
    }

    get isExecuting(): boolean {
        return this.locked;
    }

    private setIsLocked(value: boolean): void {
        this.locked = value;
    }

    private beforeRunChecks(): boolean {
        const selection = this.gate.props.itemSelection;

        if (selection === undefined) {
            console.debug("SelectAllController: selection is undefined. Check widget selection setting.");
            return false;
        }
        if (selection.type !== "Multi") {
            console.debug("SelectAllController: action can't be executed when selection is 'Single'.");
            return false;
        }

        if (this.locked) {
            console.debug("SelectAllController: action is already executing.");
            return false;
        }
        return true;
    }

    async selectAllPages(): Promise<void> {
        if (!this.beforeRunChecks()) {
            return;
        }

        this.setIsLocked(true);

        const { offset: initOffset, limit: initLimit } = this.query;
        const initSelection = this.selection().selection;
        const hasTotal = typeof this.query.totalCount === "number";
        const totalCount = this.query.totalCount ?? 0;
        let loaded = 0;
        let offset = 0;
        const pe = (type: SelectAllEventType): ProgressEvent =>
            new ProgressEvent(type, { loaded, total: totalCount, lengthComputable: hasTotal });
        // We should avoid duplicates, so, we start with clean array.
        const allItems: ObjectItem[] = [];
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        try {
            this.emitter.dispatchEvent(pe("loadstart"));
            let loading = true;
            while (loading) {
                const loadedItems = await this.query.fetchPage({
                    limit: this.pageSize,
                    offset,
                    signal
                });

                allItems.push(...loadedItems);
                loaded += loadedItems.length;
                offset += this.pageSize;
                this.emitter.dispatchEvent(pe("progress"));
                loading = !signal.aborted && this.query.hasMoreItems;
            }
            // Set allItems on success
            this.selection().setSelection(allItems);
        } catch (error) {
            if (!signal.aborted) {
                throw error;
            }
            // Restore selection on abort
            this.selection().setSelection(initSelection);
        } finally {
            this.query.setOffset(initOffset);
            this.query.setLimit(initLimit);
            this.locked = false;
            this.emitter.dispatchEvent(pe("loadend"));
            this.abortController = undefined;
        }
    }

    clearSelection(): void {
        if (this.locked) {
            console.debug("SelectAllController: can't clear selection while executing.");
            return;
        }
        this.selection().setSelection([]);
    }

    abort(): void {
        this.abortController?.abort();
        this.emitter.dispatchEvent(new ProgressEvent("abort"));
    }
}
