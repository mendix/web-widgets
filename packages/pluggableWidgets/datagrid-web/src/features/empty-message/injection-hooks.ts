import { createInjectionHooks } from "brandi-react";
import { DG_TOKENS as DG } from "../core/tokens";

export const [useEmptyPlaceholderVM] = createInjectionHooks(DG.emptyPlaceholderVM);
