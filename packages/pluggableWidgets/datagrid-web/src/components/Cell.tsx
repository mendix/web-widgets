import { createElement, ReactElement, useMemo, memo } from "react";
import { GridColumn } from "../typings/GridColumn";
import { CellComponentProps } from "../typings/CellComponent";
import { CellElement } from "./CellElement";
import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";

function CellNode(props: CellComponentProps<GridColumn>): ReactElement {
    const keyNavProps = useFocusTargetProps<HTMLDivElement>({
        columnIndex: props.columnIndex ?? -1,
        rowIndex: props.rowIndex
    });
    const handlers = useMemo(() => props.eventsController.getProps(props.item), [props.item, props.eventsController]);

    return (
        <CellElement
            alignment={props.column.alignment}
            borderTop={props.rowIndex === 0}
            className={props.column.columnClass(props.item)}
            wrapText={props.column.wrapText}
            clickable={props.clickable}
            previewAsHidden={props.preview && (!props.column.isAvailable || props.column.isHidden)}
            tabIndex={keyNavProps.tabIndex}
            ref={keyNavProps.ref}
            data-position={keyNavProps["data-position"]}
            onClick={handlers.onClick}
            onDoubleClick={handlers.onDoubleClick}
            onMouseDown={handlers.onMouseDown}
            onKeyDown={handlers.onKeyDown}
            onKeyUp={handlers.onKeyUp}
            onFocus={handlers.onFocus}
        >
            {props.column.renderCellContent(props.item)}
        </CellElement>
    );
}

export const Cell = memo(CellNode) as (props: CellComponentProps<GridColumn>) => ReactElement;
