import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { ObjectItem } from "mendix";
import { ReactElement } from "react";
import { SelectActionHelper } from "../helpers/SelectActionHelper";
import { CellComponent, EventsController } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { Row } from "./Row";

interface RowsRendererProps {
    Cell: CellComponent<GridColumn>;
    columns: GridColumn[];
    columnsHidable: boolean;
    eventsController: EventsController;
    focusController: FocusTargetController;
    interactive: boolean;
    preview: boolean;
    rowClass?: (item: ObjectItem) => string;
    rows: ObjectItem[];
    selectableWrapper?: (column: number, children: ReactElement) => ReactElement;
    selectActionHelper: SelectActionHelper;
}

export function RowsRenderer(props: RowsRendererProps): ReactElement {
    return (
        <KeyNavProvider focusController={props.focusController}>
            {props.rows.map((item, rowIndex) => {
                return (
                    <Row
                        totalRows={props.rows.length}
                        clickable={props.interactive}
                        selectActionHelper={props.selectActionHelper}
                        preview={props.preview}
                        eventsController={props.eventsController}
                        CellComponent={props.Cell}
                        className={props.rowClass?.(item)}
                        columns={props.columns}
                        index={rowIndex}
                        item={item}
                        key={`row_${item.id}`}
                        showSelectorCell={props.columnsHidable}
                        selectableWrapper={props.selectableWrapper}
                    />
                );
            })}
        </KeyNavProvider>
    );
}
