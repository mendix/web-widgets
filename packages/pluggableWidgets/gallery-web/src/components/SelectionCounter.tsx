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
            <span className="widget-gallery-selection-count">{selectionCountStore.selectedCountText}</span>
            &nbsp;
            <button className="widget-gallery-clear-selection" onClick={itemSelectHelper.onClearSelection}>
                {selectionCountStore.clearSelectionText}
            </button>
        </If>
    );
});
