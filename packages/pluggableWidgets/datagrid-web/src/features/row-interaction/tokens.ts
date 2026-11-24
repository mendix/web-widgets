import { token } from "brandi";
import { createInjectionHooks } from "brandi-react";
import type { ClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import type { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import type { VirtualGridLayout } from "@mendix/widget-plugin-grid/keyboard-navigation/VirtualGridLayout";
import type { ComputedAtom } from "@mendix/widget-plugin-mobx-kit/main";
import type { CellEventsController } from "./CellEventsController";
import type { CheckboxEventsController } from "./CheckboxEventsController";

export const ROW_INTERACTION_TOKENS = {
    virtualLayout: token<ComputedAtom<VirtualGridLayout>>("@computed:virtualLayout"),
    clickActionHelper: token<ClickActionHelper>("@service:ClickActionHelper"),
    focusService: token<FocusTargetController>("@service:FocusTargetController"),
    checkboxEventsHandler: token<CheckboxEventsController>("@service:CheckboxEventsController"),
    cellEventsHandler: token<CellEventsController>("@service:CellEventsController")
};

export const [useFocusService] = createInjectionHooks(ROW_INTERACTION_TOKENS.focusService);
export const [useCheckboxEventsHandler] = createInjectionHooks(ROW_INTERACTION_TOKENS.checkboxEventsHandler);
export const [useCellEventsHandler] = createInjectionHooks(ROW_INTERACTION_TOKENS.cellEventsHandler);
