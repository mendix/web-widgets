import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/selection/stores/SelectionCountStore";
import { createContext, useContext } from "react";
import { SelectAllProgressStore } from "../features/multi-page-selection/SelectAllProgressStore";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { RootGridStore } from "../helpers/state/RootGridStore";
import { EventsController } from "../typings/CellComponent";
import { SelectActionHelper } from "./SelectActionHelper";

export interface DatagridRootScope {
    basicData: GridBasicData;
    // Controllers
    selectionHelper: SelectionHelper | undefined;
    selectActionHelper: SelectActionHelper;
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    focusController: FocusTargetController;
    selectionCountStore: SelectionCountStore;
    selectAllProgressStore: SelectAllProgressStore;
    rootStore: RootGridStore;
}

export const DatagridContext = createContext<DatagridRootScope | null>(null);

export const useDatagridRootScope = (): DatagridRootScope => {
    const contextValue = useContext(DatagridContext);
    if (!contextValue) {
        throw new Error("useDatagridRootScope must be used within a root context provider");
    }
    return contextValue;
};
