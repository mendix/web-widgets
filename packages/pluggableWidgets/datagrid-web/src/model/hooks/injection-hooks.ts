import { createInjectionHooks } from "brandi-react";
import { CORE_TOKENS as CORE, DG_TOKENS as DG } from "../tokens";

export const [useBasicData] = createInjectionHooks(DG.basicDate);
export const [useColumnsStore] = createInjectionHooks(CORE.columnsStore);
export const [useDatagridConfig] = createInjectionHooks(CORE.config);
export const [useDatagridFilterAPI] = createInjectionHooks(DG.filterAPI);
export const [useExportProgressService] = createInjectionHooks(DG.exportProgressService);
export const [useLoaderViewModel] = createInjectionHooks(DG.loaderVM);
export const [useMainGate] = createInjectionHooks(CORE.mainGate);
export const [usePaginationService] = createInjectionHooks(DG.paginationService);
export const [useSelectionHelper] = createInjectionHooks(DG.selectionHelper);
export const [useGridStyle] = createInjectionHooks(DG.gridColumnsStyle);
export const [useQueryService] = createInjectionHooks(DG.query);
export const [useVisibleColumnsCount] = createInjectionHooks(CORE.atoms.visibleColumnsCount);
export const [useItemCount] = createInjectionHooks(CORE.atoms.itemCount);
