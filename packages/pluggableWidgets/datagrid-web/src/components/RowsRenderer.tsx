import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { ObjectItem } from "mendix";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { useColumnsStore } from "../model/hooks/injection-hooks";
import { CellComponent, EventsController } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { Row } from "./Row";

interface RowsRendererProps {
    Cell: CellComponent<GridColumn>;
    columnsHidable: boolean;
    eventsController: EventsController;
    focusController: FocusTargetController;
    interactive: boolean;
    preview: boolean;
    rowClass?: (item: ObjectItem) => string;
    rows: ObjectItem[];
    selectActionHelper: SelectActionHelper;
}

export const RowsRenderer = observer(function RowsRenderer(props: RowsRendererProps): ReactElement {
    const { visibleColumns } = useColumnsStore();
    return (
        <KeyNavProvider focusController={props.focusController}>
            {props.rows.map((item, rowIndex) => {
                return (
                    <Row
                        totalRows={props.rows.length}
                        clickable={props.interactive}
                        selectActionHelper={props.selectActionHelper}
                        eventsController={props.eventsController}
                        CellComponent={props.Cell}
                        className={props.rowClass?.(item)}
                        columns={visibleColumns}
                        index={rowIndex}
                        item={item}
                        key={`row_${item.id}`}
                        showSelectorCell={props.columnsHidable}
                    />
                );
            })}
        </KeyNavProvider>
    );
});
