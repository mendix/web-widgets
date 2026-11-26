import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { useColumnsStore } from "./features/columns/tokens";
import { useDatagridConfig, useRows } from "./features/core/tokens";
import { useRowClass, useRowKey } from "./features/datasource/tokens";
import { useCellEventsHandler, useFocusService } from "./features/row-interaction/tokens";
import { useSelectActions } from "./features/selection/tokens";
import { Row } from "./Row";

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
