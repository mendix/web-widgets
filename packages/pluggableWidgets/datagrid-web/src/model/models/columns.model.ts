import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";

/** @injectable */
export function visibleColumnsCountAtom(source: { visibleColumns: { length: number } }): ComputedAtom<number> {
    return computed(() => source.visibleColumns.length);
}
