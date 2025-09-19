import { createElement, ReactElement } from "react";
import { PseudoModal } from "./PseudoModal";
import { ExportAlert } from "./ExportAlert";

export type SelectionProgressDialogProps = {
    open: boolean;
    selectingLabel: string;
    cancelLabel: string;
    onCancel: () => void;
    progress: number;
    total: number;
};

export function SelectionProgressDialog({
    open,
    selectingLabel,
    cancelLabel,
    onCancel,
    progress,
    total
}: SelectionProgressDialogProps): ReactElement | null {
    if (!open) return null;
    return (
        <PseudoModal>
            <ExportAlert
                alertLabel={selectingLabel}
                cancelLabel={cancelLabel}
                failed={false}
                onCancel={onCancel}
                progress={progress}
                total={total}
            />
        </PseudoModal>
    );
}
