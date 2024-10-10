import { EventsController } from "./CellComponent";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { SelectionHelper } from "@mendix/widget-plugin-grid/selection";

export type GridHelpers = {
    readonly cellEventsController: EventsController;
    readonly checkboxEventsController: EventsController;
    readonly focusController: FocusTargetController;
    readonly selectActionHelper: SelectActionHelper;
    readonly selectionHelper: SelectionHelper | undefined;
};
