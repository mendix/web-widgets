import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type {
    SelectActionsService,
    SelectionDynamicProps,
    SelectionHelperService
} from "@mendix/widget-plugin-grid/main";
import type { SelectionCounterViewModel } from "@mendix/widget-plugin-grid/selection-counter/SelectionCounter.viewModel-atoms";
import type { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";

export const SELECTION_TOKENS = {
    selectionCounterCfg: token<{ position: "top" | "bottom" | "off" }>("SelectionCounterConfig"),
    selectionCounterVM: token<SelectionCounterViewModel>("SelectionCounterViewModel"),

    selectionGate: token<DerivedPropsGate<SelectionDynamicProps>>("@gate:GateForSelectionHelper"),
    selectionHelper: token<SelectionHelperService>("@service:SelectionHelperService"),
    selectActions: token<SelectActionsService>("@service:SelectActionsService"),
    selectionType: token<"Single" | "Multi" | "None">("@const:selectionType")
};

export const [useSelectionCounterViewModel] = createInjectionHooks(SELECTION_TOKENS.selectionCounterVM);

export const [useSelectionHelper] = createInjectionHooks(SELECTION_TOKENS.selectionHelper);
export const [useSelectActions] = createInjectionHooks(SELECTION_TOKENS.selectActions);
