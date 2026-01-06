import { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import { computed } from "mobx";
import { CSSProperties } from "react";
import { ColumnGroupStore } from "../../helpers/state/ColumnGroupStore";
import { DatagridConfig } from "../configs/Datagrid.config";
import { GridColumn } from "../../typings/GridColumn";
import { GridSizeStore } from "../stores/GridSize.store";

export function gridStyleAtom(
    columns: ColumnGroupStore,
    config: DatagridConfig,
    gridSizeStore: GridSizeStore
): ComputedAtom<CSSProperties> {
    return computed(
        () =>
            ({
                "--widgets-grid-template-columns": templateColumns(columns.visibleColumns, {
                    checkboxColumn: config.checkboxColumnEnabled,
                    selectorColumn: config.selectorColumnEnabled
                }),
                "--widgets-grid-template-columns-head": gridSizeStore.templateColumnsHead,
                "--widgets-grid-body-height": asPx(gridSizeStore.gridBodyHeight),
                "--widgets-grid-width": asPx(gridSizeStore.gridWidth),
                "--widgets-grid-scrollbar-size": asPx(gridSizeStore.scrollBarSize)
            }) as CSSProperties
    );
}

function asPx(v: number | undefined): string | undefined {
    if (v === undefined) {
        return undefined;
    }

    return `${v}px`;
}

function templateColumns(
    columns: GridColumn[],
    optional: {
        checkboxColumn: boolean;
        selectorColumn: boolean;
    }
): string {
    const columnSizes = columns.map(c => c.getCssWidth());

    const sizes: string[] = [];

    if (optional.checkboxColumn) {
        sizes.push("48px");
    }

    sizes.push(...columnSizes);

    if (optional.selectorColumn) {
        sizes.push("54px");
    }

    return sizes.join(" ");
}
