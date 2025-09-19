import { createElement, ReactElement } from "react";
import { SelectionCountVisibilityEnum } from "../../typings/DatagridProps";
import { SelectionCounter } from "./SelectionCounter";

type WidgetTopBarProps = {
    selectionCountVisibility?: SelectionCountVisibilityEnum;
    clearSelectionButtonLabel?: string;
    showTopBar: boolean;
    selectedCount: number;
} & JSX.IntrinsicElements["div"];

export function WidgetTopBar(props: WidgetTopBarProps): ReactElement {
    const { selectionCountVisibility, clearSelectionButtonLabel, showTopBar, selectedCount, ...restProps } = props;
    return (
        <div {...restProps} className="widget-datagrid-top-bar table-header">
            <div className="widget-datagrid-padding-top">
                {selectionCountVisibility === "top" && selectedCount > 0 && (
                    <div className="widget-datagrid-tb-start">
                        <SelectionCounter clearSelectionButtonLabel={clearSelectionButtonLabel} />
                    </div>
                )}
                {showTopBar && <div className="widget-datagrid-tb-end">{props.children}</div>}
            </div>
        </div>
    );
}
