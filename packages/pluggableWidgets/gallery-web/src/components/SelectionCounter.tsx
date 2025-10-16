import { If } from "@mendix/widget-plugin-component-kit/If";
import { observer } from "mobx-react-lite";
import { useGalleryRootScope } from "../helpers/root-context";

export const SelectionCounter = observer(function SelectionCounter() {
    const { selectionCountStore, itemSelectHelper } = useGalleryRootScope();

    return (
        <If condition={selectionCountStore.displayCount !== ""}>
            <span className="widget-gallery-selection-count">{selectionCountStore.displayCount}</span>&nbsp;|&nbsp;
            <button className="widget-gallery-clear-selection" onClick={itemSelectHelper.onClearSelection}>
                Clear selection
            </button>
        </If>
    );
});
