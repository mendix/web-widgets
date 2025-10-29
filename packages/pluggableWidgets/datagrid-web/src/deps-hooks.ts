import { createInjectionHooks } from "brandi-react";
import { TOKENS } from "./Datagrid.depsContainer";

export const [useBasicData] = createInjectionHooks(TOKENS.basicDate);

export const [useDatagridConfig] = createInjectionHooks(TOKENS.config);

export const [usePaginationService] = createInjectionHooks(TOKENS.paginationService);

export const [useSelectionCounterViewModel] = createInjectionHooks(TOKENS.selectionCounter);

export const [useLoaderViewModel] = createInjectionHooks(TOKENS.loaderViewModel);

export const [useColumnsStore] = createInjectionHooks(TOKENS.columnsStore);

export const [useExportProgressService] = createInjectionHooks(TOKENS.exportProgressService);

export const [useMainGate] = createInjectionHooks(TOKENS.mainGate);

export const [useDatagridFilterAPI] = createInjectionHooks(TOKENS.filterAPI);

export const [useSelectAllBarViewModel] = createInjectionHooks(TOKENS.selectAllBar);

export const [useSelectionDialogViewModel] = createInjectionHooks(TOKENS.selectionDialogViewModel);
