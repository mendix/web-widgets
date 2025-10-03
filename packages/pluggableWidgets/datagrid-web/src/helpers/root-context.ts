import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectAllController, SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/selection/stores/SelectionCountStore";
import { ProgressStore } from "@mendix/widget-plugin-grid/stores/ProgressStore";
import { createContext, useContext } from "react";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { EventsController } from "../typings/CellComponent";
import { SelectActionHelper } from "./SelectActionHelper";

export interface DatagridRootScope {
    basicData: GridBasicData;
    // Controllers
    selectionHelper: SelectionHelper | undefined;
    selectActionHelper: SelectActionHelper;
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    selectAllController: SelectAllController;
    focusController: FocusTargetController;
    selectionCountStore: SelectionCountStore;
    selectAllProgressStore: ProgressStore;
}

export const DatagridContext = createContext<DatagridRootScope | null>(null);

export const useDatagridRootScope = (): DatagridRootScope => {
    const contextValue = useContext(DatagridContext);
    if (!contextValue) {
        throw new Error("useDatagridRootScope must be used within a root context provider");
    }
    return contextValue;
};
