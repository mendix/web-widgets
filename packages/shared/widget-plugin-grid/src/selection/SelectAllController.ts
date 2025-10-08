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

export class SelectAllController extends EventTarget implements ReactiveController {
    private readonly gate: Gate;
    private readonly query: QueryController;
    private abortController?: AbortController;
    private locked = false;
    readonly pageSize: number = 100;

    constructor(host: ReactiveControllerHost, spec: SelectAllControllerSpec) {
        super();
        host.addController(this);
        this.gate = spec.gate;
        this.query = spec.query;

        type PrivateMembers = "setIsLocked" | "locked";
        makeObservable<this, PrivateMembers>(this, {
            setIsLocked: action,
            selection: computed,
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

    addEventListener(
        type: SelectAllEventType,
        callback: (pe: ProgressEvent<SelectAllController>) => void,
        options?: AddEventListenerOptions | boolean
    ): void {
        super.addEventListener(type, callback, options);
    }

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
        const hasTotal = typeof this.query.totalCount === "number";
        const totalCount = this.query.totalCount ?? 0;
        let loaded = 0;
        let offset = 0;
        const pe = (type: SelectAllEventType): ProgressEvent =>
            new ProgressEvent(type, { loaded, total: totalCount, lengthComputable: hasTotal });
        // We should avoid duplicates, so, we start with clean array.
        const allItems: ObjectItem[] = [];

        try {
            this.abortController = new AbortController();
            this.dispatchEvent(pe("loadstart"));
            let loading = true;
            while (loading) {
                const loadedItems = await this.query.fetchPage({
                    limit: this.pageSize,
                    offset,
                    signal: this.abortController.signal
                });

                allItems.push(...loadedItems);
                loaded += loadedItems.length;
                offset += this.pageSize;
                this.dispatchEvent(pe("progress"));
                loading = !this.abortController.signal.aborted && this.query.hasMoreItems;
            }
        } catch (error) {
            const aborted = this.abortController?.signal.aborted;
            if (!aborted) {
                throw error;
            }
        } finally {
            this.query.setOffset(initOffset);
            this.query.setLimit(initLimit);
            this.selection?.setSelection(allItems);
            this.locked = false;
            this.abortController = undefined;
            this.dispatchEvent(pe("loadend"));
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
