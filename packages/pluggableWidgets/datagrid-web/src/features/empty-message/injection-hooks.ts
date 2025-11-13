import { createInjectionHooks } from "brandi-react";
import { DG_TOKENS as DG } from "../../model/tokens";

export const [useEmptyPlaceholderVM] = createInjectionHooks(DG.emptyPlaceholderVM);
