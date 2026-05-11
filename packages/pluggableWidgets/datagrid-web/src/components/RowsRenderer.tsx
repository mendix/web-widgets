import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { Row } from "./Row";
import {
    useCellEventsHandler,
    useColumnsStore,
    useDatagridConfig,
    useFocusService,
    useRowClass,
    useRowKey,
    useRows,
    useSelectActions
} from "../model/hooks/injection-hooks";

export const RowsRenderer = observer(function RowsRenderer(): ReactElement {
    const rows = useRows().get();
    const config = useDatagridConfig();
    const { visibleColumns } = useColumnsStore();
    const rowClass = useRowClass();
    const rowKey = useRowKey();
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
                        key={`row_${rowKey.key.get(item)}`}
                        showSelectorCell={config.columnsHidable}
                        checkboxColumnEnabled={config.checkboxColumnEnabled}
                    />
                );
            })}
        </KeyNavProvider>
    );
});
