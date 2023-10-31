import { createElement } from "react";
import { CellElement, CellElementProps } from "./CellElement";
import { useFocusTargetProps } from "../features/keyboard-navigation/useFocusTargetProps";

export type SelectorCellProps = CellElementProps & {
    rowIndex: number;
    columnIndex?: number;
};

export function SelectorCell({ rowIndex, columnIndex, ...rest }: SelectorCellProps): React.ReactElement {
    const keyNavProps = useFocusTargetProps({ columnIndex: columnIndex ?? -1, rowIndex });
    return <CellElement {...rest} {...keyNavProps} className="column-selector" />;
}
