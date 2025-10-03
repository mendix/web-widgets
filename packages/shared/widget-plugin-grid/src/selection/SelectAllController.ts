import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { SelectionMultiValue, SelectionSingleValue } from "mendix";
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
    readonly pageSize: number = 2;

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
                throw error;
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
