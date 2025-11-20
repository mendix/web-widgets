import { ReactNode } from "react";
import { ExportWidget } from "../../components/ExportWidget";
import { useExportProgressService, useTexts } from "../../model/hooks/injection-hooks";

export const ExportProgressDialog = function ExportProgressDialog(props: { onExportCancel?: () => void }): ReactNode {
    const progressSrv = useExportProgressService();
    const texts = useTexts();

    if (!progressSrv.inProgress) return null;

    return (
        <ExportWidget
            alertLabel={texts.exportDialogLabel ?? "Export progress"}
            cancelLabel={texts.cancelExportLabel ?? "Cancel data export"}
            failed={false}
            onCancel={props.onExportCancel}
            open={progressSrv.inProgress}
            progress={progressSrv.loaded}
            total={progressSrv.total}
        />
    );
};
