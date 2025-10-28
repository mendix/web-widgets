import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { useSelectionCounterViewModel } from "../deps-hooks";
import { SelectionCounter } from "./SelectionCounter";

type WidgetTopBarProps = {
    pagination: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export const WidgetTopBar = observer(function WidgetTopBar(props: WidgetTopBarProps): ReactElement {
    const { pagination, ...rest } = props;
    const selectionCounter = useSelectionCounterViewModel();

    return (
        <div {...rest} className="widget-datagrid-top-bar table-header">
            <div className="widget-datagrid-padding-top">
                <If condition={selectionCounter.isTopCounterVisible}>
                    <div className="widget-datagrid-tb-start">
                        <SelectionCounter />
                    </div>
                </If>
                <If condition={!!pagination}>
                    <div className="widget-datagrid-tb-end">{pagination}</div>
                </If>
            </div>
        </div>
    );
});
