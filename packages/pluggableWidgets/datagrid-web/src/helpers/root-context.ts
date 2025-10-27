import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { createContext, useContext } from "react";
import { EventsController } from "../typings/CellComponent";
import { SelectActionHelper } from "./SelectActionHelper";

export interface LegacyRootScope {
    selectionHelper: SelectionHelper | undefined;
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
