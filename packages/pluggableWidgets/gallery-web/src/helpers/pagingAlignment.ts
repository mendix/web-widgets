export type PagingAlignment = "left" | "center" | "right";

/**
 * Design property classes that select the pagination alignment.
 *
 * These names are a contract with the "Pagination alignment" design property defined in
 * `packages/modules/data-widgets/src/themesource/datawidgets/web/design-properties.json`.
 * Renaming a class there without updating this map silently breaks placement.
 *
 * Checked in this order, so a root element carrying more than one alignment class resolves
 * deterministically to the first entry below.
 */
const ALIGNMENT_CLASS: ReadonlyArray<[string, PagingAlignment]> = [
    ["widget-gallery-pagination-left", "left"],
    ["widget-gallery-pagination-center", "center"],
    ["widget-gallery-pagination-right", "right"]
];

export const DEFAULT_PAGING_ALIGNMENT: PagingAlignment = "right";

/**
 * Reads the pagination alignment from the widget's root class list.
 *
 * Falls back to `right` -- the position pagination has always had -- when no alignment class is
 * present, so galleries that never set the design property keep their current layout.
 */
export function parsePagingAlignment(className: string | undefined): PagingAlignment {
    if (!className) {
        return DEFAULT_PAGING_ALIGNMENT;
    }

    const classes = className.split(/\s+/);

    for (const [name, alignment] of ALIGNMENT_CLASS) {
        if (classes.includes(name)) {
            return alignment;
        }
    }

    return DEFAULT_PAGING_ALIGNMENT;
}
