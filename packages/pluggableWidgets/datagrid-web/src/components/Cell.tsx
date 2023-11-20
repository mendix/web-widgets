import { createElement, ReactElement, memo } from "react";
import { GridColumn } from "../typings/GridColumn";
import { CellComponentProps } from "../typings/CellComponent";
import { CellElement } from "./CellElement";

// eslint-disable-next-line prefer-arrow-callback
const component = memo(function Cell(props: CellComponentProps<GridColumn>): ReactElement {
    return (
        <CellElement
            alignment={props.column.alignment}
            borderTop={props.rowIndex === 0}
            className={props.column.columnClass(props.item)}
            onClick={props.onClick}
            onKeyDown={props.onKeyDown}
            wrapText={props.column.wrapText}
            clickable={props.clickable}
            previewAsHidden={props.preview && (props.column.hidden || props.column.supress)}
        >
            {props.column.renderCellContent(props.item)}
        </CellElement>
    );
});

// Override NamedExoticComponent type
export const Cell = component as (props: CellComponentProps<GridColumn>) => ReactElement;
