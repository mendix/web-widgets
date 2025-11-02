import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { SelectionCounter } from "../features/selection-counter/SelectionCounter";
import { useSelectionCounterViewModel } from "../features/selection-counter/injection-hooks";

type WidgetTopBarProps = {
    pagination: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export const WidgetTopBar = observer(function WidgetTopBar(props: WidgetTopBarProps): ReactElement {
    const { pagination, ...rest } = props;
    const selectionCounterVM = useSelectionCounterViewModel();

    return (
        <div {...rest} className="widget-datagrid-top-bar table-header">
            <div className="widget-datagrid-padding-top">
                <div className="widget-datagrid-tb-start">
                    <If condition={selectionCounterVM.isTopCounterVisible}>
                        <SelectionCounter />
                    </If>
                </div>
                <div className="widget-datagrid-tb-end">
                    <If condition={!!pagination}>{pagination}</If>
                </div>
            </div>
        </div>
    );
});
