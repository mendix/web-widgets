import { createInjectionHooks } from "brandi-react";
import { SA_TOKENS } from "../../model/tokens";

export const [useSelectAllBarViewModel] = createInjectionHooks(SA_TOKENS.selectAllBarVM);
export const [useSelectionDialogViewModel] = createInjectionHooks(SA_TOKENS.selectionDialogVM);
