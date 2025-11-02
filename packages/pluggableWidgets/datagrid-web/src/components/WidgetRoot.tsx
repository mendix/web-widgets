import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ComponentPropsWithoutRef, ReactElement, useMemo, useRef } from "react";
import { useSelectionDialogViewModel } from "../features/select-all/injection-hooks";
import { SelectionMethod } from "../helpers/SelectActionHelper";

type P = ComponentPropsWithoutRef<"div">;

export interface WidgetRootProps extends P {
    className?: string;
    selection?: boolean;
    selectionMethod: SelectionMethod;
    exporting?: boolean;
}

export const WidgetRoot = observer(function WidgetRoot(props: WidgetRootProps): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    const { className, selectionMethod, selection, exporting, children, ...rest } = props;
    const { isOpen: selectingAllPages } = useSelectionDialogViewModel();
    const style = useMemo(() => {
        const s = { ...props.style };
        if ((exporting || selectingAllPages) && ref.current) {
            s.height = ref.current.offsetHeight;
        }
        return s;
    }, [props.style, exporting, selectingAllPages]);

    return (
        <div
            {...rest}
            ref={ref}
            style={style}
            className={classNames(className, "widget-datagrid", {
                "widget-datagrid-exporting": exporting,
                "widget-datagrid-selecting-all-pages": selectingAllPages,
                "widget-datagrid-selectable-rows": selection,
                "widget-datagrid-selection-method-checkbox": selection && selectionMethod === "checkbox",
                "widget-datagrid-selection-method-click": selection && selectionMethod === "rowClick"
            })}
        >
            {children}
        </div>
    );
});
