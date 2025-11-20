import { ReactNode } from "react";
import { ExportAlert } from "../../components/ExportAlert";
import { PseudoModal } from "../../components/PseudoModal";
import { useExportProgressService, useTexts } from "../../model/hooks/injection-hooks";

export const ExportProgressDialog = function ExportProgressDialog(props: { onExportCancel?: () => void }): ReactNode {
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
};
