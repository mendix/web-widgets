import { createInjectionHooks } from "brandi-react";
import { DG_TOKENS } from "../../model/tokens";

export const [useSelectionCounterViewModel] = createInjectionHooks(DG_TOKENS.selectionCounterVM);
