import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { action, computed, makeObservable, observable, when } from "mobx";
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
    readonly pageSize: number = 1024;
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
            // Here we use keepAlive to make sure selection is never outdated.
            // selection: computed({ keepAlive: true }),
            selection: computed,
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

    get selection(): SelectionMultiValue | undefined {
        const selection = this.gate.props.itemSelection;
        if (selection === undefined) return;
        if (selection.type === "Single") return;
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

    async selectAllPages(): Promise<{ success: boolean }> {
        if (!this.beforeRunChecks()) {
            return { success: false };
        }

        this.setIsLocked(true);

        const { offset: initOffset, limit: initLimit } = this.query;
        const initSelection = this.selection?.selection ?? [];
        const hasTotal = typeof this.query.totalCount === "number";
        const totalCount = this.query.totalCount ?? 0;
        let loaded = 0;
        let offset = 0;
        let success = false;
        const pe = (type: SelectAllEventType): ProgressEvent =>
            new ProgressEvent(type, { loaded, total: totalCount, lengthComputable: hasTotal });
        // We should avoid duplicates, so, we start with clean array.
        const allItems: ObjectItem[] = [];
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        performance.mark("SelectAll_Start");
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
            success = true;
        } catch (error) {
            if (!signal.aborted) {
                console.error("SelectAllController: an error was encountered during the 'select all' action.");
                console.error(error);
            }
        } finally {
            // Restore init view
            // This step should be done before loadend to avoid UI flickering
            await this.query.fetchPage({
                limit: initLimit,
                offset: initOffset
            });
            await this.reloadSelection();
            this.emitter.dispatchEvent(pe("loadend"));

            // const selectionBeforeReload = this.selection?.selection ?? [];
            // Reload selection to make sure setSelection is working as expected.
            this.selection?.setSelection(success ? allItems : initSelection);
            this.locked = false;
            this.abortController = undefined;

            performance.mark("SelectAll_End");
            const measure1 = performance.measure("Measure1", "SelectAll_Start", "SelectAll_End");
            console.debug(`Data grid 2: 'select all' took ${(measure1.duration / 1000).toFixed(2)} seconds.`);
            // eslint-disable-next-line no-unsafe-finally
            return { success };
        }
    }

    /**
     * This method is a hack to reload selection. To work it requires at leas one object.
     * The problem is that if we setting value equal to current selection, then prop is
     * not reloaded. We solve this by setting ether empty array or array with one object.
     * @returns
     */
    reloadSelection(): Promise<void> {
        const prevSelection = this.selection;
        const items = this.query.items ?? [];
        const currentSelection = this.selection?.selection ?? [];
        const newSelection = currentSelection.length > 0 ? [] : items;
        this.selection?.setSelection(newSelection);
        // `when` resolves when selection value is updated
        const ok = when(() => this.selection !== prevSelection);
        return ok;
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
        this.emitter.dispatchEvent(new ProgressEvent("abort"));
    }
}
