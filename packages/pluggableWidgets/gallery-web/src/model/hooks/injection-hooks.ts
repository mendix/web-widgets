import { createInjectionHooks } from "brandi-react";
import { CORE_TOKENS as CORE, GY_TOKENS as GY } from "../tokens";

export const [useGalleryRootVM] = createInjectionHooks(GY.galleryRootVM);
export const [useMainGate] = createInjectionHooks(CORE.mainGate);

export const [useSelectActions] = createInjectionHooks(GY.selectActions);
export const [useSelectionHelper] = createInjectionHooks(GY.selectionHelper);

export const [usePaginationConfig] = createInjectionHooks(GY.paging.paginationConfig);
export const [usePaginationVM] = createInjectionHooks(GY.paging.paginationVM);

export const [useFilterAPI] = createInjectionHooks(GY.filterAPI);

export const [useSortAPI] = createInjectionHooks(GY.sortAPI);