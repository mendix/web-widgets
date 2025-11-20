import { useFocusTargetProps } from "@mendix/widget-plugin-grid/keyboard-navigation/useFocusTargetProps";
import { ObjectItem } from "mendix";
import { computed } from "mobx";
import { observer } from "mobx-react-lite";
import { ReactElement, ReactNode, useMemo } from "react";
import { EventsController } from "../typings/CellComponent";
import { GridColumn } from "../typings/GridColumn";
import { CellElement } from "./CellElement";

interface DataCellProps {
    children?: ReactNode;
    className?: string;
    column: GridColumn;
    item: ObjectItem;
    key?: string | number;
    rowIndex: number;
    columnIndex?: number;
    clickable?: boolean;
    preview?: boolean;
    eventsController: EventsController;
}

export const DataCell = observer(function DataCell(props: DataCellProps): ReactElement {
    const keyNavProps = useFocusTargetProps<HTMLDivElement>({
        columnIndex: props.columnIndex ?? -1,
        rowIndex: props.rowIndex
    });
    const handlers = useMemo(() => props.eventsController.getProps(props.item), [props.item, props.eventsController]);
    const children = computed(() => props.column.renderCellContent(props.item)).get();

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
            {children}
        </CellElement>
    );
});
