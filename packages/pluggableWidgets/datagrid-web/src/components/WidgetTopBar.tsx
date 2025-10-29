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
                <div className="widget-datagrid-tb-start">
                    <If condition={selectionCounter.isTopCounterVisible}>
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
