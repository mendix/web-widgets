import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { ReactNode } from "react";
import type { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import type { EmptyPlaceholderViewModel } from "./EmptyPlaceholder.viewModel";

export const EMPTY_MESSAGE_TOKENS = {
    emptyPlaceholderVM: token<EmptyPlaceholderViewModel>("EmptyPlaceholderViewModel"),
    emptyPlaceholderWidgets: token<ComputedAtom<ReactNode>>("@computed:emptyPlaceholder")
};

export const [useEmptyPlaceholderVM] = createInjectionHooks(EMPTY_MESSAGE_TOKENS.emptyPlaceholderVM);
