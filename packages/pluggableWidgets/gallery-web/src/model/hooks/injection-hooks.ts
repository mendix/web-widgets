import { createInjectionHooks } from "brandi-react";
import { CORE_TOKENS as CORE, GY_TOKENS as GY } from "../tokens";

export const [useGalleryRootVM] = createInjectionHooks(GY.galleryRootVM);
export const [useGalleryItemVM] = createInjectionHooks(GY.galleryItemVM);
export const [useEmptyPlaceholderVM] = createInjectionHooks(GY.emptyPlaceholderVM);

export const [useMainGate] = createInjectionHooks(CORE.mainGate);
export const [useItems] = createInjectionHooks(CORE.items);
export const [useGalleryConfig] = createInjectionHooks(CORE.config);

export const [useSelectActions] = createInjectionHooks(GY.selectActions);
export const [useSelectionHelper] = createInjectionHooks(GY.selectionHelper);

export const [usePaginationConfig] = createInjectionHooks(GY.paging.paginationConfig);
export const [usePaginationVM] = createInjectionHooks(GY.paging.paginationVM);

export const [useFilterAPI] = createInjectionHooks(GY.filterAPI);

export const [useSortAPI] = createInjectionHooks(GY.sortAPI);

export const [useTextsService] = createInjectionHooks(CORE.texts);

export const [useKeyNavFocus] = createInjectionHooks(GY.keyNavFocusService);
export const [useItemEventsVM] = createInjectionHooks(GY.itemEventsVM);
export const [useLayoutService] = createInjectionHooks(GY.layoutService);
