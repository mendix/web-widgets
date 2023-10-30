import { createElement } from "react";
import { CellElement, CellElementProps } from "./CellElement";
import { useKeyNavProps } from "../features/keyboard-navigation/useKeyNavProps";

export type SelectorCellProps = CellElementProps & {
    rowIndex: number;
    columnIndex?: number;
};

export function SelectorCell({ rowIndex, columnIndex, ...rest }: SelectorCellProps): React.ReactElement {
    const keyNavProps = useKeyNavProps({ columnIndex: columnIndex ?? -1, rowIndex });
    return <CellElement {...rest} {...keyNavProps} className="column-selector" />;
}
