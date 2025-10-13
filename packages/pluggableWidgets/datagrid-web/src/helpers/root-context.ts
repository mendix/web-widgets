import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { ProgressStore } from "@mendix/widget-plugin-grid/stores/ProgressStore";
import { SelectionCountStore } from "@mendix/widget-plugin-grid/stores/SelectionCountStore";
import { createContext, useContext } from "react";
import { GridBasicData } from "../helpers/state/GridBasicData";
import { EventsController } from "../typings/CellComponent";
import { SelectActionHelper } from "./SelectActionHelper";
import { SelectAllBarViewModel } from "./state/SelectAllBarViewModel";
import { SelectionProgressDialogViewModel } from "./state/SelectionProgressDialogViewModel";

export interface DatagridRootScope {
    basicData: GridBasicData;
    // Controllers
    selectionHelper: SelectionHelper | undefined;
    selectActionHelper: SelectActionHelper;
    cellEventsController: EventsController;
    checkboxEventsController: EventsController;
    focusController: FocusTargetController;
    selectionCountStore: SelectionCountStore;
    selectAllProgressStore: ProgressStore;
    selectAllBarViewModel: SelectAllBarViewModel;
    selectionProgressDialogViewModel: SelectionProgressDialogViewModel;
}

export const DatagridContext = createContext<DatagridRootScope | null>(null);

export const useDatagridRootScope = (): DatagridRootScope => {
    const contextValue = useContext(DatagridContext);
    if (!contextValue) {
        throw new Error("useDatagridRootScope must be used within a root context provider");
    }
    return contextValue;
};
