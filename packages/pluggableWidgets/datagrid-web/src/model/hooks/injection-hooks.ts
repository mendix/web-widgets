import { createInjectionHooks } from "brandi-react";
import { TOKENS } from "../tokens";

export const [useBasicData] = createInjectionHooks(TOKENS.basicDate);
export const [useColumnsStore] = createInjectionHooks(TOKENS.columnsStore);
export const [useDatagridConfig] = createInjectionHooks(TOKENS.config);
export const [useDatagridFilterAPI] = createInjectionHooks(TOKENS.filterAPI);
export const [useExportProgressService] = createInjectionHooks(TOKENS.exportProgressService);
export const [useLoaderViewModel] = createInjectionHooks(TOKENS.loaderVM);
export const [useMainGate] = createInjectionHooks(TOKENS.mainGate);
export const [usePaginationService] = createInjectionHooks(TOKENS.paginationService);
