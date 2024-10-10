import { KeyNavProvider } from "@mendix/widget-plugin-grid/keyboard-navigation/context";
import { ObjectItem } from "mendix";
import { createElement, memo } from "react";
import { useHelpersContext } from "../helpers/helpers-context";
import { CellComponent } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { Row } from "./Row";

interface RowsRendererProps {
    Cell: CellComponent<GridColumn>;
    columns: GridColumn[];
    columnsHidable: boolean;
    interactive: boolean;
    preview: boolean;
    rowClass?: (item: ObjectItem) => string;
    rows: ObjectItem[];
    selectableWrapper?: (column: number, children: React.ReactElement) => React.ReactElement;
}

// eslint-disable-next-line prefer-arrow-callback
export const RowsRenderer = memo(function RowsRenderer(props: RowsRendererProps): React.ReactElement {
    return (
        <KeyNavProvider focusController={useHelpersContext().focusController}>
            {props.rows.map((item, rowIndex) => {
                return (
                    <Row
                        totalRows={props.rows.length}
                        interactive={props.interactive}
                        preview={props.preview}
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
});
