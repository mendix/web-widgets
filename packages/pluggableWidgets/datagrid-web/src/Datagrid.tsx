import { ContainerProvider } from "brandi-react";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { DatagridContainerProps } from "../typings/DatagridProps";
import { useColumnsStore } from "./features/columns/tokens";
import { useExportProgressService } from "./features/data-export/tokens";
import { useDataExport } from "./features/data-export/useDataExport";
import { useDatagridContainer } from "./useDatagridContainer";
import { useDataGridJSActions } from "./useDataGridJSActions";
import { Widget } from "./Widget";

const DatagridRoot = observer((props: DatagridContainerProps): ReactElement => {
    const columnsStore = useColumnsStore();
    const exportProgress = useExportProgressService();

    const [abortExport] = useDataExport(props, columnsStore, exportProgress);

    useDataGridJSActions();

    return <Widget onExportCancel={abortExport} showTopScrollbar={props.showTopScrollbar} />;
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
