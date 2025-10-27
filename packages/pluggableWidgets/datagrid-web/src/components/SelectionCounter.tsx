import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { useSelectionCounter } from "../deps-hooks";
import { useLegacyContext } from "../helpers/root-context";

type SelectionCounterLocation = "top" | "bottom" | undefined;

export const SelectionCounter = observer(function SelectionCounter({
    location
}: {
    location?: SelectionCounterLocation;
}) {
    const selectionCountStore = useSelectionCounter();
    const { selectActionHelper } = useLegacyContext();

    const containerClass = location === "top" ? "widget-datagrid-tb-start" : "widget-datagrid-pb-start";

    return (
        <If condition={selectionCountStore.displayCount !== ""}>
            <div className={containerClass}>
                <span className="widget-datagrid-selection-count" aria-live="polite" aria-atomic="true">
                    {selectionCountStore.displayCount}
                </span>
                &nbsp;|&nbsp;
                <button className="widget-datagrid-clear-selection" onClick={selectActionHelper.onClearSelection}>
                    {selectionCountStore.clearButtonLabel}
                </button>
            </div>
        </If>
    );
});
