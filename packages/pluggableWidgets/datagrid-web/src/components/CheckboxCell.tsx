import { createElement, ReactElement, useCallback, useRef } from "react";
import { CellElement, CellElementProps } from "./CellElement";
import { useFocusTargetProps } from "../features/keyboard-navigation/useFocusTargetProps";

export type CheckboxCellProps = CellElementProps & {
    rowIndex: number;
    columnIndex?: number;
    checked?: boolean;
    onInputClick?: React.MouseEventHandler;
    checkboxAriaLabel?: string;
};

export function CheckboxCell({
    rowIndex,
    columnIndex,
    checked,
    onInputClick,
    checkboxAriaLabel,
    ...rest
}: CheckboxCellProps): ReactElement {
    const inputRef = useRef(null);
    const keyNavProps = useFocusTargetProps({
        columnIndex: columnIndex ?? -1,
        rowIndex,
        focusTarget: useCallback(() => inputRef.current, [])
    });
    return (
        <CellElement {...rest} {...keyNavProps} className="widget-datagrid-col-select" tabIndex={-1}>
            <input
                checked={checked}
                type="checkbox"
                tabIndex={keyNavProps.tabIndex}
                onChange={stub}
                onClick={onInputClick}
                ref={inputRef}
                aria-label={`${checkboxAriaLabel ?? "Select row"} ${rowIndex + 1}`}
            />
        </CellElement>
    );
}
function stub(): void {
    // to prevent react test error about checked prop without onChange.
}
