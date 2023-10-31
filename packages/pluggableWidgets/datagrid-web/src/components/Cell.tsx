import { createElement, ReactElement, memo } from "react";
import { GridColumn } from "../typings/GridColumn";
import { CellComponentProps } from "../typings/CellComponent";
import { CellElement } from "./CellElement";
import { useFocusTargetProps } from "../features/keyboard-navigation/useFocusTargetProps";

// eslint-disable-next-line prefer-arrow-callback
const component = memo(function Cell(props: CellComponentProps<GridColumn>): ReactElement {
    const keyNavProps = useFocusTargetProps({ columnIndex: props.columnIndex ?? -1, rowIndex: props.rowIndex });

    return (
        <CellElement
            alignment={props.column.alignment}
            borderTop={props.rowIndex === 0}
            className={props.column.columnClass(props.item)}
            wrapText={props.column.wrapText}
            clickable={props.clickable}
            previewAsHidden={props.preview && (props.column.initiallyHidden || !props.column.visible)}
            {...keyNavProps}
        >
            {props.column.renderCellContent(props.item)}
        </CellElement>
    );
});

// Override NamedExoticComponent type
export const Cell = component as (props: CellComponentProps<GridColumn>) => ReactElement;
