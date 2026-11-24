import { createInjectionHooks } from "brandi-react";
import { DG_TOKENS } from "../core/tokens";

export const [useSelectionCounterViewModel] = createInjectionHooks(DG_TOKENS.selectionCounterVM);
