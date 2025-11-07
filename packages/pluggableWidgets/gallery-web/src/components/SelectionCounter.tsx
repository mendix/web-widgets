import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { useGalleryRootScope } from "../helpers/root-context";

type SelectionCounterLocation = "top" | "bottom" | undefined;

export const SelectionCounter = observer(function SelectionCounter({
    location
}: {
    location?: SelectionCounterLocation;
}) {
    const { selectionCountStore, itemSelectHelper } = useGalleryRootScope();

    const containerClass = location === "top" ? "widget-gallery-tb-start" : "widget-gallery-pb-start";

    const clearButtonAriaLabel = `${selectionCountStore.clearButtonLabel} (${selectionCountStore.selectedCount} selected)`;

    return (
        <If condition={selectionCountStore.selectedCountText !== ""}>
            <div className={containerClass}>
                <span className="widget-gallery-selection-count" aria-live="polite" aria-atomic="true">
                    {selectionCountStore.selectedCountText}
                </span>
                &nbsp;|&nbsp;
                <button
                    className="widget-gallery-clear-selection"
                    onClick={itemSelectHelper.onClearSelection}
                    aria-label={clearButtonAriaLabel}
                >
                    {selectionCountStore.clearButtonLabel}
                </button>
            </div>
        </If>
    );
});
