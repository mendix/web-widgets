import { PagingAlignment } from "./pagingAlignment";

/** Elements that can be placed in a top bar or footer slot. */
export type BarElement = "pagination" | "counter" | "loadMore";

/** Which element renders in each slot of a bar, or `null` when the slot is empty. */
export interface BarSlots {
    start: BarElement | null;
    middle: BarElement | null;
    end: BarElement | null;
}

export interface ResolveSlotsParams {
    alignment: PagingAlignment;
    hasCounter: boolean;
    hasLoadMore: boolean;
    hasPagination: boolean;
}

const PAGINATION_SLOT: Record<PagingAlignment, keyof BarSlots> = {
    left: "start",
    center: "middle",
    right: "end"
};

/** Primary slot each element prefers, and the fallback slot it moves to if pagination claimed the primary. */
const DEFAULT_SLOTS: Record<
    Exclude<BarElement, "pagination">,
    { primary: keyof BarSlots; fallback: keyof BarSlots }
> = {
    counter: { primary: "start", fallback: "end" },
    loadMore: { primary: "middle", fallback: "end" }
};

/**
 * Decides which element renders in each slot of a bar.
 *
 * The same result drives the footer, the top bar and the editor preview, so they cannot disagree
 * about placement. The top bar simply never has a load more element.
 */
export function resolveSlots(params: ResolveSlotsParams): BarSlots {
    const slots: BarSlots = { start: null, middle: null, end: null };

    if (params.hasPagination) {
        slots[PAGINATION_SLOT[params.alignment]] = "pagination";
    }

    if (params.hasCounter) {
        const { primary, fallback } = DEFAULT_SLOTS.counter;
        slots[slots[primary] === null ? primary : fallback] = "counter";
    }
    if (params.hasLoadMore) {
        const { primary, fallback } = DEFAULT_SLOTS.loadMore;
        slots[slots[primary] === null ? primary : fallback] = "loadMore";
    }

    return slots;
}
