import { createInjectionHooks } from "brandi-react";
import { TOKENS } from "../../model/tokens";

export const [useEmptyPlaceholderVM] = createInjectionHooks(TOKENS.emptyPlaceholderVM);
