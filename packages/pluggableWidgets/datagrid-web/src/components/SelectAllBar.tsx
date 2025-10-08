import { observer } from "mobx-react-lite";
import { createElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";

export const SelectAllBar = observer(function SelectAllBar(): React.ReactNode {
    const {
        selectAllController,
        basicData: { selectionStatus }
    } = useDatagridRootScope();

    if (selectionStatus === "unknown") return null;

    if (selectionStatus === "none") return null;

    return (
        <div>
            <button onClick={() => selectAllController.selectAllPages()}>Select remaining</button>
        </div>
    );
});
