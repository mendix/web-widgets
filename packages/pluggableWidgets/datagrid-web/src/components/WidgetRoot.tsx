import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";
import { useDatagridRootVM } from "../model/hooks/injection-hooks";

export const WidgetRoot = observer(function WidgetRoot({ children }: PropsWithChildren): ReactElement {
    const vm = useDatagridRootVM();

    return (
        <div
            ref={vm.ref}
            style={vm.style}
            className={classNames(vm.className, "widget-datagrid", {
                "widget-datagrid-exporting": vm.exporting,
                "widget-datagrid-selecting-all-pages": vm.selecting,
                "widget-datagrid-selectable-rows": vm.selectable,
                "widget-datagrid-selection-method-checkbox": vm.selectable && vm.selectionMethod === "checkbox",
                "widget-datagrid-selection-method-click": vm.selectable && vm.selectionMethod === "rowClick"
            })}
        >
            {children}
        </div>
    );
});
