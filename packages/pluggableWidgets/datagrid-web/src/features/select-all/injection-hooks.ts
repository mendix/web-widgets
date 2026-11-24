import { createInjectionHooks } from "brandi-react";
import { SA_TOKENS } from "../core/tokens";

export const [useSelectAllBarViewModel] = createInjectionHooks(SA_TOKENS.selectAllBarVM);
export const [useSelectionDialogViewModel] = createInjectionHooks(SA_TOKENS.selectionDialogVM);
