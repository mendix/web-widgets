import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import {
    useCellEventsHandler,
    useColumnsStore,
    useDatagridConfig,
    useFocusService,
    useRowClass,
    useRows,
    useSelectActions
} from "../model/hooks/injection-hooks";
import { Row } from "./Row";

export const RowsRenderer = observer(function RowsRenderer(): ReactElement {
    const rows = useRows().get();
    const config = useDatagridConfig();
    const { visibleColumns } = useColumnsStore();
    const rowClass = useRowClass();
    const cellEventsController = useCellEventsHandler();
    const focusService = useFocusService();
    const selectActions = useSelectActions();

    return (
        <KeyNavProvider focusController={focusService}>
            {rows.map((item, rowIndex) => {
                return (
                    <Row
                        totalRows={rows.length}
                        clickable={config.isInteractive}
                        selectActions={selectActions}
                        eventsController={cellEventsController}
                        className={rowClass.class.get(item)}
                        columns={visibleColumns}
                        index={rowIndex}
                        item={item}
                        key={`row_${item.id}`}
                        showSelectorCell={config.columnsHidable}
                        checkboxColumnEnabled={config.checkboxColumnEnabled}
                    />
                );
            })}
        </KeyNavProvider>
    );
});
