import { createElement, ReactElement } from "react";
import { useDatagridRootScope } from "../helpers/root-context";
import { ExportAlert } from "./ExportAlert";
import { PseudoModal } from "./PseudoModal";

export function SelectionProgressDialog(): ReactElement | null {
    const { selectionProgressDialogViewModel: vm } = useDatagridRootScope();
    if (!vm.dialogOpen) return null;
    return (
        <PseudoModal>
            <ExportAlert
                alertLabel={vm.selectingAllLabel}
                cancelLabel={vm.cancelSelectionLabel}
                failed={false}
                onCancel={() => vm.onCancel()}
                progress={vm.progress}
                total={vm.total}
            />
        </PseudoModal>
    );
}
