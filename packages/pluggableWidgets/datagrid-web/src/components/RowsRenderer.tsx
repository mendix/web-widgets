import { ObjectItem } from "mendix";
import { createElement, useId } from "react";
import { CellComponent, EventsController } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { FocusTargetController } from "@mendix/widget-plugin-grid/keyboard-navigation/FocusTargetController";
import { Row } from "./Row";
import { SelectActionHelper } from "../helpers/SelectActionHelper";

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
    selectableWrapper?: (column: number, children: React.ReactElement) => React.ReactElement;
    selectActionHelper: SelectActionHelper;
}

export function RowsRenderer(props: RowsRendererProps): React.ReactElement {
    const id = useId();
    console.time(`RowsRenderer_${id}`);
    try {
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
    } finally {
        console.timeEnd(`RowsRenderer_${id}`);
    }
}
