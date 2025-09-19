import { ListValue, ObjectItem } from "mendix";
import { createNanoEvents, Emitter } from "nanoevents";

export interface TraversalOptions {
    chunkSize?: number;
    signal?: AbortSignal;
    onProgress?: (processed: number, total?: number) => void;
    onChunk?: (items: ObjectItem[], offset: number) => void | Promise<void>;
}

interface TraversalEvents {
    statechange: (state: { offset: number; limit: number; status: string }) => void;
}

/**
 * Traverses all items in a ListValue datasource by paginating through chunks.
 * Mirrors the pattern used by ExportController - snapshots state, iterates, then restores.
 */
export async function traverseAllItems(ds: ListValue, options: TraversalOptions = {}): Promise<void> {
    // Use the datasource's current limit as chunk size to respect its pagination
    const naturalChunkSize = ds.limit ?? 25;
    const { chunkSize = naturalChunkSize, signal, onProgress, onChunk } = options;

    // Snapshot current state
    const snapshot = {
        offset: ds.offset,
        limit: ds.limit
    };

    // Create event emitter for tracking datasource changes
    const emitter: Emitter<TraversalEvents> = createNanoEvents();
    let processed = 0;

    try {
        // Start from the beginning
        let currentOffset = 0;
        let hasMore = true;
        let chunkIndex = 0;

        while (hasMore && !signal?.aborted) {
            // Set pagination parameters

            ds.setOffset(currentOffset);
            if (ds.limit !== chunkSize) {
                ds.setLimit(chunkSize);
            }

            // Trigger reload
            ds.reload();

            // Wait for reload to complete with simpler polling
            await waitForReload(ds, currentOffset, chunkSize);

            // Process items
            const items = ds.items ?? [];

            if (items.length === 0) {
                break; // No more items
            }

            // Handle the chunk
            if (onChunk) {
                await onChunk(items, currentOffset);
            }

            // Update progress
            processed += items.length;
            onProgress?.(processed, ds.totalCount);

            // Check if this was the last page
            // Stop if we've processed all items according to totalCount
            // or if we got fewer items than expected
            const totalCount = ds.totalCount;
            const reachedTotal = totalCount && processed >= totalCount;
            const gotPartialChunk = items.length < chunkSize;
            hasMore = !reachedTotal && !gotPartialChunk;
            currentOffset += chunkSize;
            chunkIndex++;

            // Yield to UI
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (signal?.aborted) {
            // Traversal aborted
        } else {
            // Traversal completed
        }
    } finally {
        // Always restore original view state
        await restoreSnapshot(ds, snapshot, emitter);
    }
}

/**
 * Reloads the datasource and waits for it to stabilize
 */
async function reloadAndWait(ds: ListValue, emitter: Emitter<TraversalEvents>): Promise<void> {
    const targetOffset = ds.offset;
    const targetLimit = ds.limit;

    // Set up one-time listener for state change
    const statePromise = new Promise<void>(resolve => {
        const checkState = (): void => {
            if (ds.status !== "loading" && ds.offset === targetOffset && ds.limit === targetLimit) {
                resolve();
            }
        };

        // Check immediately in case already loaded
        checkState();

        // Otherwise wait for state change
        const unsubscribe = emitter.on("statechange", state => {
            if (state.status !== "loading" && state.offset === targetOffset && state.limit === targetLimit) {
                unsubscribe();
                resolve();
            }
        });
    });

    // Trigger reload
    ds.reload();

    // Poll for changes (fallback for when events aren't available)
    const pollPromise = pollDatasource(ds, targetOffset, targetLimit);

    // Race between event-based and polling
    await Promise.race([statePromise, pollPromise]);
}

/**
 * Simpler wait function that waits for datasource to be ready
 */
async function waitForReload(
    ds: ListValue,
    expectedOffset: number,
    expectedLimit: number,
    maxAttempts = 50
): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
        if (ds.status !== "loading" && ds.offset === expectedOffset && ds.limit === expectedLimit && ds.items) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.warn("Datasource wait timeout - proceeding anyway");
}

/**
 * Polls the datasource until it reflects the expected state
 */
async function pollDatasource(
    ds: ListValue,
    expectedOffset: number,
    expectedLimit: number,
    maxAttempts = 50
): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
        if (ds.status !== "loading" && ds.offset === expectedOffset && ds.limit === expectedLimit) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.warn("Datasource polling timeout - proceeding anyway");
}

/**
 * Restores the datasource to its original offset/limit
 */
async function restoreSnapshot(
    ds: ListValue,
    snapshot: { offset: number; limit: number },
    emitter: Emitter<TraversalEvents>
): Promise<void> {
    // Restore original pagination
    ds.setLimit(snapshot.limit);
    ds.setOffset(snapshot.offset);

    // Wait for restore to complete
    await reloadAndWait(ds, emitter);
}
