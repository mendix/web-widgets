import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { createContext, useContext } from "react";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { EventsController } from "../typings/CellComponent";
import { SelectActionHelper } from "./SelectActionHelper";
import { SelectionCountStore } from "./state/SelectionCountStore";

export interface DatagridRootScope {
    basicData: GridBasicData;
    // Controllers
    selectionHelper: SelectionHelper | undefined;
    selectActionHelper: SelectActionHelper;
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    focusController: FocusTargetController;
    selectionCountStore: SelectionCountStore;
}

export const DatagridContext = createContext<DatagridRootScope | null>(null);

export const useDatagridRootScope = (): DatagridRootScope => {
    const contextValue = useContext(DatagridContext);
    if (!contextValue) {
        throw new Error("useDatagridRootScope must be used within a root context provider");
    }
    return contextValue;
};
