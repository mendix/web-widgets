import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";
import { usePaginationConfig } from "../model/hooks/injection-hooks";
import { Pagination } from "./Pagination";

export const WidgetTopBar = observer(function WidgetTopBar(): ReactElement {
    const pgConfig = usePaginationConfig();
    const selectionCounter = useSelectionCounterViewModel();

    return (
        <div className="widget-datagrid-top-bar table-header">
            <div className="widget-datagrid-padding-top">
                <div className="widget-datagrid-tb-start">
                    <If condition={selectionCounter.isTopCounterVisible}>
                        <SelectionCounter />
                    </If>
                </div>
                <div className="widget-datagrid-tb-end">
                    <If condition={pgConfig.pagingPosition !== "bottom"}>
                        <Pagination />
                    </If>
                </div>
            </div>
        </div>
    );
});
