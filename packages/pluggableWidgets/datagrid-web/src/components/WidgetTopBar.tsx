import { createElement, ReactElement } from "react";
import { SelectionCountVisibilityEnum } from "../../typings/DatagridProps";
import { SelectionCounter } from "./SelectionCounter";

type WidgetTopBarProps = {
    selectionCountVisibility?: SelectionCountVisibilityEnum;
    clearSelectionButtonLabel?: string;
} & JSX.IntrinsicElements["div"];

export function WidgetTopBar(props: WidgetTopBarProps): ReactElement {
    const { selectionCountVisibility, clearSelectionButtonLabel } = props;

    console.warn(selectionCountVisibility);

    return (
        <div {...props} className="widget-datagrid-top-bar table-header">
            {selectionCountVisibility === "top" && (
                <SelectionCounter clearSelectionButtonLabel={clearSelectionButtonLabel} />
            )}
            {props.children}
        </div>
    );
}
