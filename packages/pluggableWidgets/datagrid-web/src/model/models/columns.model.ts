import { computed } from "mobx";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";

/** @injectable */
export function visibleColumnsCountAtom(source: { visibleColumns: { length: number } }): ComputedAtom<number> {
    return computed(() => source.visibleColumns.length);
}

/** @injectable */
export function columnCount(
    visibleColumns: ComputedAtom<number>,
    config: { checkboxColumnEnabled: boolean }
): ComputedAtom<number> {
    return computed(() => {
        const count = visibleColumns.get();

        return config.checkboxColumnEnabled ? count + 1 : count;
    });
}
