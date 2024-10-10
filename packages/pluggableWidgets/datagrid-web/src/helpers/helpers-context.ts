import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import {
    LayoutProps,
    useFocusTargetController
} from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { SelectionHelper, useSelectionHelper } from "@mendix/widget-plugin-grid/selection";
import { createContext, useContext, useMemo, useRef } from "react";
import { DatagridContainerProps } from "../../typings/DatagridProps";
import { CellEventsController, useCellEventsController } from "../features/row-interaction/CellEventsController";
import {
    CheckboxEventsController,
    useCheckboxEventsController
} from "../features/row-interaction/CheckboxEventsController";
import { SelectActionHelper, useSelectActionHelper } from "./SelectActionHelper";
import { IColumnGroupStore } from "./state/ColumnGroupStore";

type GridHelpers = {
    readonly cellEventsController: CellEventsController;
    readonly checkboxEventsController: CheckboxEventsController;
    readonly focusController: FocusTargetController;
    readonly selectActionHelper: SelectActionHelper;
    readonly selectionHelper: SelectionHelper | undefined;
};

const context = createContext<GridHelpers | null>(null);

export const HelpersProvider = context.Provider;

interface Props
    extends Pick<
        DatagridContainerProps,
        | "itemSelection"
        | "datasource"
        | "onSelectionChange"
        | "itemSelectionMethod"
        | "showSelectAllToggle"
        | "pageSize"
        | "itemSelectionMode"
        | "onClickTrigger"
        | "onClick"
    > {
    columnsStore: IColumnGroupStore;
}

export function useProvideGridHelpers(props: Props): GridHelpers {
    const selectionHelper = useSelectionHelper(props.itemSelection, props.datasource, props.onSelectionChange);

    const selectActionHelper = useSelectActionHelper(props, selectionHelper);

    const clickActionHelper = useClickActionHelper({
        onClickTrigger: props.onClickTrigger,
        onClick: props.onClick
    });

    const layout = getLayoutProps(props, selectActionHelper.showCheckboxColumn);
    const focusController = useFocusTargetController(layout);

    const cellEventsController = useCellEventsController(selectActionHelper, clickActionHelper, focusController);

    const checkboxEventsController = useCheckboxEventsController(selectActionHelper, focusController);

    const helpers = useMemo(
        () => ({
            cellEventsController,
            checkboxEventsController,
            focusController,
            selectActionHelper,
            selectionHelper
        }),
        [cellEventsController, checkboxEventsController, focusController, selectActionHelper, selectionHelper]
    );

    return useChangeGuard(helpers);
}

function getLayoutProps(props: Props, withCheckbox: boolean): LayoutProps {
    const visibleColumnsCount = withCheckbox
        ? props.columnsStore.visibleColumns.length + 1
        : props.columnsStore.visibleColumns.length;

    return {
        rows: props.datasource.items ? props.datasource.items.length : 0,
        columns: visibleColumnsCount,
        pageSize: props.pageSize
    };
}

function useChangeGuard(deps: GridHelpers): GridHelpers {
    const ctx = useRef<GridHelpers>(deps);
    const prevDeps = ctx.current;

    if (!Object.is(prevDeps, deps)) {
        console.error("GridHelpers object should not change between renders.");
    }

    for (const key of Object.keys(deps) as Array<keyof GridHelpers>) {
        if (Object.is(prevDeps[key], deps[key])) {
            continue;
        }
        console.error(`GridHelpers.${key} should not change between renders.`);
    }

    return (ctx.current = deps);
}

export function useHelpersContext(): GridHelpers {
    const ctx = useContext(context);
    if (ctx === null) {
        throw new Error("useHelpersContext must be used within a GridHelpersProvider");
    }
    return ctx;
}
