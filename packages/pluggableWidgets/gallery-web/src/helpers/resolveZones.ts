import { PagingAlignment } from "./pagingAlignment";

/** Occupants that can be placed in a top bar or footer zone. */
export type BarOccupant = "pagination" | "counter" | "loadMore";

/** Which occupant renders in each zone of a bar, or `null` when the zone is empty. */
export interface BarZones {
    start: BarOccupant | null;
    middle: BarOccupant | null;
    end: BarOccupant | null;
}

export interface ResolveZonesParams {
    alignment: PagingAlignment;
    hasCounter: boolean;
    hasLoadMore: boolean;
    hasPagination: boolean;
}

const PAGINATION_ZONE: Record<PagingAlignment, keyof BarZones> = {
    left: "start",
    center: "middle",
    right: "end"
};

/** Zone each occupant uses when pagination does not claim it. */
const NATURAL_ZONE = {
    counter: "start",
    loadMore: "middle"
} as const satisfies Record<Exclude<BarOccupant, "pagination">, keyof BarZones>;

/**
 * Decides which occupant renders in each zone of a bar.
 *
 * Pagination claims the zone named by its alignment; whatever normally lives there is displaced to
 * the end zone. At most one occupant is ever displaced, because pagination claims a single zone and
 * the only displaceable occupants (counter, load more) live in different zones -- so the end zone
 * never has to hold two things.
 *
 * The same result drives the footer, the top bar and the editor preview, so they cannot disagree
 * about placement. The top bar simply never has a load more occupant.
 */
export function resolveZones(params: ResolveZonesParams): BarZones {
    const zones: BarZones = { start: null, middle: null, end: null };

    if (params.hasPagination) {
        zones[PAGINATION_ZONE[params.alignment]] = "pagination";
    }

    const displaceable: Array<Exclude<BarOccupant, "pagination">> = [];
    if (params.hasCounter) {
        displaceable.push("counter");
    }
    if (params.hasLoadMore) {
        displaceable.push("loadMore");
    }

    for (const occupant of displaceable) {
        const zone = NATURAL_ZONE[occupant];
        if (zones[zone] === null) {
            zones[zone] = occupant;
        } else {
            zones.end = occupant;
        }
    }

    return zones;
}
