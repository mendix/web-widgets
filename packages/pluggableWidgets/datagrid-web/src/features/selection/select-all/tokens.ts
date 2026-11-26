import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { SelectAllService, TaskProgressService } from "@mendix/widget-plugin-grid/main";
import type { SelectAllFeature } from "@mendix/widget-plugin-grid/select-all/select-all.feature";
import type {
    BarStore,
    ObservableSelectAllTexts,
    SelectAllEvents
} from "@mendix/widget-plugin-grid/select-all/select-all.model";
import type { DerivedPropsGate, Emitter } from "@mendix/widget-plugin-mobx-kit/main";
import type { SelectAllBarViewModel } from "./SelectAllBar.viewModel";
import type { SelectionProgressDialogViewModel } from "./SelectionProgressDialog.viewModel";
import type { MainGateProps } from "../../../../typings/MainGateProps";

/** "Select all" module tokens. */
export const SA_TOKENS = {
    barStore: token<BarStore>("SelectAllBarStore"),
    emitter: token<Emitter<SelectAllEvents>>("SelectAllEmitter"),
    gate: token<DerivedPropsGate<MainGateProps>>("MainGateForSelectAllContainer"),
    progressService: token<TaskProgressService>("SelectAllProgressService"),
    selectAllTextsStore: token<ObservableSelectAllTexts>("SelectAllTextsStore"),
    selectAllBarVM: token<SelectAllBarViewModel>("SelectAllBarViewModel"),
    selectAllService: token<SelectAllService>("SelectAllService"),
    selectionDialogVM: token<SelectionProgressDialogViewModel>("SelectionProgressDialogViewModel"),
    enableSelectAll: token<boolean>("enableSelectAllFeatureFlag"),
    feature: token<SelectAllFeature>("SelectAllFeature")
};

export const [useSelectAllBarViewModel] = createInjectionHooks(SA_TOKENS.selectAllBarVM);
export const [useSelectionDialogViewModel] = createInjectionHooks(SA_TOKENS.selectionDialogVM);
