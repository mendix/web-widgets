import { useClickActionHelper } from "@mendix/widget-plugin-grid/helpers/ClickActionHelper";
import { useFocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetController";
import { useConst } from "@mendix/widget-plugin-mobx-kit/react/useConst";
import { ContainerProvider } from "brandi-react";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { Widget } from "./components/Widget";
import { useDataExport } from "./features/data-export/useDataExport";
import { useCellEventsController } from "./features/row-interaction/CellEventsController";
import { useCheckboxEventsController } from "./features/row-interaction/CheckboxEventsController";
import { LegacyContext } from "./helpers/root-context";
import { useDataGridJSActions } from "./helpers/useDataGridJSActions";
import {
    useColumnsStore,
    useDatagridConfig,
    useExportProgressService,
    useMainGate,
    useSelectActions,
    useSelectionHelper
} from "./model/hooks/injection-hooks";
import { useDatagridContainer } from "./model/hooks/useDatagridContainer";

const DatagridRoot = observer((props: DatagridContainerProps): ReactElement => {
    const config = useDatagridConfig();
    const gate = useMainGate();
    const columnsStore = useColumnsStore();
    const exportProgress = useExportProgressService();
    const items = gate.props.datasource.items ?? [];

    const [abortExport] = useDataExport(props, columnsStore, exportProgress);

    const selectionHelper = useSelectionHelper();

    const selectActionHelper = useSelectActions();

    const clickActionHelper = useClickActionHelper({
        onClickTrigger: props.onClickTrigger,
        onClick: props.onClick
    });

    useDataGridJSActions(selectActionHelper);

    const visibleColumnsCount = config.checkboxColumnEnabled
        ? columnsStore.visibleColumns.length + 1
        : columnsStore.visibleColumns.length;

    const focusController = useFocusTargetController({
        rows: items.length,
        columns: visibleColumnsCount,
        pageSize: props.pageSize
    });

    const cellEventsController = useCellEventsController(selectActionHelper, clickActionHelper, focusController);

    const checkboxEventsController = useCheckboxEventsController(selectActionHelper, focusController);

    return (
        <LegacyContext.Provider
            value={useConst({
                selectionHelper,
                selectActionHelper,
                cellEventsController,
                checkboxEventsController,
                focusController
            })}
        >
            <Widget onExportCancel={abortExport} />
        </LegacyContext.Provider>
    );
});

DatagridRoot.displayName = "DatagridComponent";

export default function Datagrid(props: DatagridContainerProps): ReactElement | null {
    const container = useDatagridContainer(props);

    // NOTE: As of version 5 of brandi-react, ContainerProvider clones the container implicitly.
    // Isolated flag ensures that we don't inherit any bindings from parent containers. (Datagrid in Datagrid scenario)
    return (
        <ContainerProvider container={container} isolated>
            <DatagridRoot {...props} />
        </ContainerProvider>
    );
}
