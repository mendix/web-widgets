import { createInjectionHooks } from "brandi-react";
import { TOKENS } from "../../model/tokens";

export const [useSelectAllBarViewModel] = createInjectionHooks(TOKENS.selectAllBarVM);
export const [useSelectionDialogViewModel] = createInjectionHooks(TOKENS.selectionDialogVM);
