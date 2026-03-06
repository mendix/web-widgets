import { createInjectionHooks } from "brandi-react";
import { CORE_TOKENS, DG_TOKENS } from "../../model/tokens";

export const [useSelectionCounterViewModel] = createInjectionHooks(DG_TOKENS.selectionCounterVM);
export const [useSelectionCounterTexts] = createInjectionHooks(CORE_TOKENS.selection.selectedCounterTextsStore);
