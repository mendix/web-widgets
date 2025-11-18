import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { ObjectItem } from "mendix";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useLegacyContext } from "../helpers/root-context";
import { useColumnsStore, useDatagridConfig, useRowClass } from "../model/hooks/injection-hooks";
import { Row } from "./Row";

interface RowsRendererProps {
    rows: ObjectItem[];
}

export const RowsRenderer = observer(function RowsRenderer({ rows }: RowsRendererProps): ReactElement {
    const config = useDatagridConfig();
    const { visibleColumns } = useColumnsStore();
    const rowClass = useRowClass();
    const { cellEventsController, focusController, selectActionHelper } = useLegacyContext();
    return (
        <KeyNavProvider focusController={focusController}>
            {rows.map((item, rowIndex) => {
                return (
                    <Row
                        totalRows={rows.length}
                        clickable={config.isInteractive}
                        selectActionHelper={selectActionHelper}
                        eventsController={cellEventsController}
                        className={rowClass.class.get(item)}
                        columns={visibleColumns}
                        index={rowIndex}
                        item={item}
                        key={`row_${item.id}`}
                        showSelectorCell={config.columnsHidable}
                    />
                );
            })}
        </KeyNavProvider>
    );
});
