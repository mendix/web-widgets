import { ReactElement } from "react";
import { CellElement, CellElementProps } from "../../components/CellElement";

export type SelectorCellProps = CellElementProps;

export function SelectorCell(props: SelectorCellProps): ReactElement {
    return <CellElement {...props} className="column-selector" />;
}
