import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { ExportAlert } from "../../ui/ExportAlert";
import { PseudoModal } from "../../ui/PseudoModal";
import { useExportProgressService, useTexts } from "../core/hooks/injection-hooks";

export const ExportProgressDialog = observer(function ExportProgressDialog(props: {
    onExportCancel?: () => void;
}): ReactElement | null {
    const progressSrv = useExportProgressService();
    const texts = useTexts();

    if (!progressSrv.inProgress) return null;

    return (
        <PseudoModal>
            <ExportAlert
                alertLabel={texts.exportDialogLabel ?? "Export progress"}
                cancelLabel={texts.cancelExportLabel ?? "Cancel data export"}
                failed={false}
                onCancel={props.onExportCancel}
                progress={progressSrv.loaded}
                total={progressSrv.total}
            />
        </PseudoModal>
    );
});
