import { DatasourceController } from "@mendix/widget-plugin-grid/query/DatasourceController";
import { MultiSelectionHelper, SelectionHelper } from "@mendix/widget-plugin-grid/selection/helpers";
import { ReactiveController, ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/reactive-controller";
import { ListValue, ObjectItem } from "mendix";
import { SelectAllProgressStore } from "./SelectAllProgressStore";

interface MultiPageSelectionControllerSpec {
    query: DatasourceController;
    progressStore: SelectAllProgressStore;
}

export class MultiPageSelectionController implements ReactiveController {
    private query: DatasourceController;
    private progressStore: SelectAllProgressStore;
    private abortController?: AbortController;
    private locked = false;

    constructor(host: ReactiveControllerHost, spec: MultiPageSelectionControllerSpec) {
        host.addController(this);
        this.query = spec.query;
        this.progressStore = spec.progressStore;
    }

    get isRunning(): boolean {
        return this.locked;
    }

    setup(): () => void {
        // No setup needed for now
        return () => {
            // Cleanup
            this.abort();
        };
    }

    /**
     * Checks if multi-page selection is possible given the current state
     */
    canSelectAllPages(enabled: boolean, selectionType: string): boolean {
        return enabled && selectionType === "Multi";
    }

    /**
     * Starts the multi-page selection process
     */
    async selectAllPages(datasource: ListValue, selectionHelper: SelectionHelper): Promise<boolean> {
        if (this.locked) {
            return false;
        }

        if (selectionHelper.type !== "Multi") {
            return false;
        }

        this.locked = true;
        let success = false;

        try {
            // Ensure totalCount is available
            const totalCount = await this.ensureTotalCount(datasource);

            if (!totalCount || totalCount <= 0) {
                return false;
            }

            // Check if everything fits in current page
            const currentPageSize = datasource.items?.length ?? 0;
            if (totalCount <= currentPageSize) {
                return false;
            }

            // Start progress tracking
            this.progressStore.onloadstart(totalCount);
            this.abortController = new AbortController();

            // Use controller-based traversal to properly handle pagination
            const naturalChunkSize = datasource.limit ?? 25;
            if (selectionHelper.type !== "Multi") {
                throw new Error("Expected MultiSelectionHelper");
            }
            const multiHelper = selectionHelper;
            await this.selectAllWithController(multiHelper, totalCount, naturalChunkSize);

            success = true;
        } catch (_error) {
            // Selection failed or was aborted
            throw new Error("MultiPageSelectionController: Selection failed or was aborted", { cause: _error });
        } finally {
            this.progressStore.onloadend();
            this.locked = false;
            this.abortController = undefined;
        }

        return success;
    }

    /**
     * Controller-based selection that properly handles datasource pagination
     */
    private async selectAllWithController(
        multiHelper: MultiSelectionHelper,
        totalCount: number,
        chunkSize: number
    ): Promise<void> {
        // Snapshot current state for restoration
        const originalOffset = this.query.offset;
        const originalLimit = this.query.limit;
        const allItems: ObjectItem[] = [];

        try {
            const processedIds = new Set<string>();
            let currentOffset = 0;
            let processed = 0;

            while (processed < totalCount && !this.abortController?.signal.aborted) {
                // Use controller to set pagination
                this.query.setOffset(currentOffset);

                // Wait for the datasource to reflect the change
                await this.waitForDatasourceUpdate(currentOffset, chunkSize);

                const items = this.query.datasource.items ?? [];

                if (items.length === 0) {
                    break;
                }

                // Add new items, avoiding duplicates
                for (const item of items) {
                    const itemId = item.id as string;
                    if (!processedIds.has(itemId)) {
                        processedIds.add(itemId);
                        allItems.push(item);
                    }
                }

                processed += items.length;
                this.progressStore.onprogress(processed);

                // Check if we got fewer items than expected (end of data)
                if (items.length < chunkSize) {
                    break;
                }

                currentOffset += chunkSize;

                // Small delay to yield to UI
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } finally {
            // Always restore the original page, but set selection after restoration
            await this.restoreOriginalStateAndSetSelection(originalOffset, originalLimit, allItems, multiHelper);
        }
    }

    /**
     * Restores the original datasource state and then sets the selection
     * This ensures the user stays on their original page while keeping all selected items
     */
    private async restoreOriginalStateAndSetSelection(
        originalOffset: number,
        originalLimit: number,
        allItems: ObjectItem[],
        multiHelper: MultiSelectionHelper
    ): Promise<void> {
        if (this.abortController?.signal.aborted) {
            // If aborted, just restore state without setting selection
            this.query.setOffset(originalOffset);
            return;
        }

        if (allItems.length === 0) {
            // No items to select, just restore state
            this.query.setOffset(originalOffset);
            return;
        }

        // First, set the selection while we have all the items
        (multiHelper as any).selectionValue.setSelection(allItems);
        (multiHelper as any)._resetRange();

        // Small delay to ensure selection is committed
        await new Promise(resolve => setTimeout(resolve, 50));

        // Now restore the original page
        this.query.setOffset(originalOffset);

        // Wait for the datasource to reflect the restored state
        await this.waitForDatasourceUpdate(originalOffset, originalLimit);
    }

    /**
     * Waits for the datasource to reflect the controller changes
     */
    private async waitForDatasourceUpdate(
        expectedOffset: number,
        expectedLimit: number,
        maxAttempts = 20
    ): Promise<void> {
        for (let i = 0; i < maxAttempts; i++) {
            const ds = this.query.datasource;
            if (ds.status !== "loading" && ds.offset === expectedOffset && ds.limit === expectedLimit) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    /**
     * Ensures totalCount is available, requesting it if necessary
     */
    private async ensureTotalCount(datasource: ListValue): Promise<number | undefined> {
        let totalCount = datasource.totalCount;

        if (typeof totalCount !== "number" || totalCount <= 0) {
            // Request total count
            this.query.requestTotalCount(true);

            // Wait for it to become available
            const maxAttempts = 20;
            for (let i = 0; i < maxAttempts; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));

                totalCount = datasource.totalCount;
                const status = datasource.status;

                if (typeof totalCount === "number" && totalCount > 0 && status !== "loading") {
                    break;
                }
            }
        }

        return totalCount;
    }

    /**
     * Aborts the current selection process
     */
    abort(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.progressStore.oncancel();
            this.locked = false;
        }
    }
}
