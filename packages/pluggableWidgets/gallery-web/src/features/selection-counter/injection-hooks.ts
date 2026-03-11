import { createInjectionHooks } from "brandi-react";
import { GY_TOKENS } from "../../model/tokens";

export const [useSelectionCounterViewModel] = createInjectionHooks(GY_TOKENS.selectionCounterVM);
