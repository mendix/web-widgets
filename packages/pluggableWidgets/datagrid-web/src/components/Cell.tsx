import { createElement, ReactElement, memo, useMemo } from "react";
import { GridColumn } from "../typings/GridColumn";
import { CellComponentProps } from "../typings/CellComponent";
import { CellElement } from "./CellElement";
import { useFocusTargetProps } from "../features/keyboard-navigation/useFocusTargetProps";

// eslint-disable-next-line prefer-arrow-callback
const component = memo(function Cell(props: CellComponentProps<GridColumn>): ReactElement {
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
            previewAsHidden={props.preview && (props.column.initiallyHidden || !props.column.visible)}
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
});

// Override NamedExoticComponent type
export const Cell = component as (props: CellComponentProps<GridColumn>) => ReactElement;
