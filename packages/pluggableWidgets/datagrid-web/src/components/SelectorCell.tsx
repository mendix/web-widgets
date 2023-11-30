import { createElement } from "react";
import { CellElement, CellElementProps } from "./CellElement";

export type SelectorCellProps = CellElementProps;

export function SelectorCell(props: SelectorCellProps): React.ReactElement {
    return <CellElement {...props} className="column-selector" />;
}
