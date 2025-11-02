import { createInjectionHooks } from "brandi-react";
import { TOKENS } from "../../model/tokens";

export const [useSelectionCounterViewModel] = createInjectionHooks(TOKENS.selectionCounterVM);
