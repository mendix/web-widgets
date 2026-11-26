import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { CSSProperties } from "react";
import type { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import type { ColumnGroupStore } from "./ColumnGroupStore";
import type { GridColumn } from "./GridColumn";

export const COLUMNS_TOKENS = {
    columnsStore: token<ColumnGroupStore>("ColumnGroupStore"),
    column: token<GridColumn>("@store:GridColumn"),
    gridColumnsStyle: token<ComputedAtom<CSSProperties>>("@computed:GridColumnsStyle")
};

export const [useColumnsStore] = createInjectionHooks(COLUMNS_TOKENS.columnsStore);
export const [useGridStyle] = createInjectionHooks(COLUMNS_TOKENS.gridColumnsStyle);
export const [useColumn] = createInjectionHooks(COLUMNS_TOKENS.column);

export type { ColumnFilterSettings, ColumnPersonalizationSettings } from "./column-settings";
export type { ColumnGroupStore, IColumnGroupStore } from "./ColumnGroupStore";
export type { ColumnId, GridColumn, SortDirection, SortInstruction, SortRule } from "./GridColumn";
