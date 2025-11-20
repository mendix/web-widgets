import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";

export function pageSizeAtom(source: { pageSize: number }): ComputedAtom<number> {
    return computed(() => source.pageSize);
}
