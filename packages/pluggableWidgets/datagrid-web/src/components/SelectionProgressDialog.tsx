import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useSelectionDialogViewModel } from "../deps-hooks";
import { ExportAlert } from "./ExportAlert";
import { PseudoModal } from "./PseudoModal";

export const SelectionProgressDialog = observer(function SelectionProgressDialog(): ReactNode {
    const vm = useSelectionDialogViewModel();

    if (!vm.isOpen) return null;

    return (
        <PseudoModal>
            <ExportAlert
                alertLabel={vm.selectingAllLabel}
                cancelLabel={vm.cancelSelectionLabel}
                failed={false}
                onCancel={() => vm.onCancel()}
                progress={vm.loaded}
                total={vm.total}
            />
        </PseudoModal>
    );
});
