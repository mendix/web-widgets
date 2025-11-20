import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectionHelperService } from "@mendix/widget-plugin-grid/main";
import { createContext, useContext } from "react";
import { SelectActionHelper } from "../model/services/GridSelectActionsProvider.service";
import { EventsController } from "../typings/CellComponent";

export interface LegacyRootScope {
    selectionHelper: SelectionHelperService | undefined;
    selectActionHelper: SelectActionHelper;
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    focusController: FocusTargetController;
}

export const LegacyContext = createContext<LegacyRootScope | null>(null);

export const useLegacyContext = (): LegacyRootScope => {
    const contextValue = useContext(LegacyContext);
    if (!contextValue) {
        throw new Error("useDatagridRootScope must be used within a root context provider");
    }
    return contextValue;
};
