import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";
import { CSSProperties } from "react";
import { ColumnGroupStore } from "../../helpers/state/ColumnGroupStore";
import { DatagridConfig } from "../configs/Datagrid.config";

export function gridStyleAtom(columns: ColumnGroupStore, config: DatagridConfig): ComputedAtom<CSSProperties> {
    return computed(() => {
        return gridStyle(columns.visibleColumns, {
            checkboxColumn: config.checkboxColumnEnabled,
            selectorColumn: config.selectorColumnEnabled
        });
    });
}

function gridStyle(
    columns: Array<{ getCssWidth(): string }>,
    optional: {
        checkboxColumn?: boolean;
        selectorColumn?: boolean;
    }
): CSSProperties {
    const columnSizes = columns.map(c => c.getCssWidth());

    const sizes: string[] = [];

    if (optional.checkboxColumn) {
        sizes.push("48px");
    }

    sizes.push(...columnSizes);

    if (optional.selectorColumn) {
        sizes.push("54px");
    }

    return {
        gridTemplateColumns: sizes.join(" ")
    };
}
