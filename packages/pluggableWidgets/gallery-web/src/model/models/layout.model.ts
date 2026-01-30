import { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed, trace } from "mobx";

/** @injectable */
export function layoutAtom(
    layoutStore: {
        numberOfRows: number;
        numberOfColumns: number;
    },
    pageSize: ComputedAtom<number>
): ComputedAtom<VirtualGridLayout> {
    return computed(() => {
        trace()
        return new VirtualGridLayout(layoutStore.numberOfRows, layoutStore.numberOfColumns, pageSize.get())
    }, { name: '[gallery]:@computed:layoutAtom' });
}

/** @injectable */
export function numberOfColumnsAtom(layoutStore: { numberOfColumns: number }): ComputedAtom<number> {
    return computed(() => layoutStore.numberOfColumns);
}
