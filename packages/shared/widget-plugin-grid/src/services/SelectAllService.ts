import { DerivedPropsGate, SetupComponent, SetupComponentHost } from "@mendix/widget-plugin-mobx-kit/main";
import { ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
import { action, computed, makeObservable, observable, when } from "mobx";
import { QueryService } from "../interfaces/QueryService";
import { TaskProgressService } from "../interfaces/TaskProgressService";

interface DynamicProps {
    itemSelection?: SelectionMultiValue | SelectionSingleValue;
}

export class SelectAllService implements SetupComponent {
    private locked = false;
    private abortController?: AbortController;
    private readonly pageSize = 1024;

    constructor(
        host: SetupComponentHost,
        private gate: DerivedPropsGate<DynamicProps>,
        private query: QueryService,
        private progress: TaskProgressService
    ) {
        host.add(this);
        type PrivateMembers = "setIsLocked" | "locked";
        makeObservable<this, PrivateMembers>(this, {
            setIsLocked: action,
            canExecute: computed,
            isExecuting: computed,
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
            console.debug("SelectAllService: selection is undefined. Check widget selection setting.");
            return false;
        }
        if (selection.type !== "Multi") {
            console.debug("SelectAllService: action can't be executed when selection is 'Single'.");
            return false;
        }

        if (this.locked) {
            console.debug("SelectAllService: action is already executing.");
            return false;
        }
        return true;
    }

    /**
     * This method is a hack to reload selection. To work it requires at leas one object.
     * The problem is that if we setting value equal to current selection, then prop is
     * not reloaded. We solve this by setting ether empty array or array with one object.
     */
    private reloadSelection(): Promise<void> {
        const prevSelection = this.selection;
        const items = this.query.items ?? [];
        const currentSelection = this.selection?.selection ?? [];
        const newSelection = currentSelection.length > 0 ? [] : items;
        this.selection?.setSelection(newSelection);
        return when(() => this.selection !== prevSelection);
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
        const pe = (type: "loadstart" | "progress" | "loadend"): ProgressEvent =>
            new ProgressEvent(type, { loaded, total: totalCount, lengthComputable: hasTotal });
        // We should avoid duplicates, so, we start with clean array.
        const allItems: ObjectItem[] = [];
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        performance.mark("SelectAll_Start");
        try {
            this.progress.onloadstart(pe("loadstart"));
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
                this.progress.onprogress(pe("progress"));
                loading = !signal.aborted && this.query.hasMoreItems;
            }
            success = true;
        } catch (error) {
            if (!signal.aborted) {
                console.error("SelectAllService: an error was encountered during the 'select all' action.");
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
            this.progress.onloadend();

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

    clearSelection(): void {
        if (this.locked) {
            console.debug("SelectAllService: can't clear selection while executing.");
            return;
        }
        this.selection?.setSelection([]);
    }

    abort(): void {
        this.abortController?.abort();
    }
}
