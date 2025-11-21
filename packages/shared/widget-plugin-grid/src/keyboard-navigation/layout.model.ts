import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";
import { VirtualGridLayout } from "./VirtualGridLayout";

/** @injectable */
export function layoutAtom(
    rows: ComputedAtom<number>,
    columns: ComputedAtom<number>,
    pageSize: ComputedAtom<number>
): ComputedAtom<VirtualGridLayout> {
    return computed(() => new VirtualGridLayout(rows.get(), columns.get(), pageSize.get()));
}
