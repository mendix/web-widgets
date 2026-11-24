import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { WidgetRootViewModel } from "./WidgetRoot.viewModel";

export const ROOT_TOKENS = {
    datagridRootVM: token<WidgetRootViewModel>("WidgetRootViewModel")
};

export const [useDatagridRootVM] = createInjectionHooks(ROOT_TOKENS.datagridRootVM);
