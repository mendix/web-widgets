import { QueryController } from "../query/query-controller";
import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/props-gate";
import { ObjectItem, SelectionMultiValue, SelectionSingleValue } from "mendix";
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

export async function selectAllPages({
    query,
    gate,
    progress,
    bufferSize,
    signal
}: {
    query: QueryController;
    gate: Gate;
    progress: ISelectAllProgressStore;
    bufferSize: number;
    signal: AbortSignal;
}): Promise<boolean> {
    if (!gate.props.itemSelection || gate.props.itemSelection.type !== "Multi") {
        return false;
    }

    if (!query.hasMoreItems) {
        return false;
    }

    const originalOffset = query.offset;
    const originalLimit = query.limit;

    const totalCount = query.totalCount;
    if (totalCount && totalCount <= bufferSize) {
        // Direct selection without progress
        const allItems = await query.fetchPage({ limit: totalCount, offset: 0, signal });
        gate.props.itemSelection?.setSelection(allItems);
        return true;
    }

    if (totalCount && totalCount > 0) {
        progress.onloadstart(totalCount);
    } else {
        progress.onloadstart(0);
        progress.lengthComputable = false;
    }

    const allItems: ObjectItem[] = [];
    const pageLimit = Math.max(1, bufferSize || query.limit || 25);
    let offset = 0;

    try {
        while (!signal.aborted) {
            const page = await query.fetchPage({ limit: pageLimit, offset, signal });
            if (!page.length) break;
            allItems.push(...page);
            offset += pageLimit;
            if (progress.lengthComputable && totalCount && totalCount > 0) {
                progress.onprogress(Math.min(allItems.length, totalCount));
            } else {
                progress.onprogress(allItems.length);
            }
            if (!query.hasMoreItems) break;
        }

        if (signal.aborted) {
            return false;
        }
        gate.props.itemSelection?.setSelection(allItems);

        // Restore original pagination
        query.setLimit(originalLimit);
        query.setOffset(originalOffset);
        return true;
    } finally {
        progress.onloadend();
    }
}

export function clearAllPages(gate: Gate): boolean {
    if (!gate.props.itemSelection || gate.props.itemSelection.type !== "Multi") {
        return false;
    }
    gate.props.itemSelection.setSelection([]);
    return true;
}
