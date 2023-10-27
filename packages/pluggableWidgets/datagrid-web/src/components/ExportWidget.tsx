import { createElement, ReactElement, PropsWithChildren } from "react";
import { PseudoModal } from "./PseudoModal";
import { ExportAlert, ExportAlertProps } from "./ExportAlert";

type ExportWidgetProps = PropsWithChildren<
    ExportAlertProps & {
        open: boolean;
    }
>;

export function ExportWidget({ open, ...alertProps }: ExportWidgetProps): ReactElement | null {
    if (!open) {
        return null;
    }

    return (
        <PseudoModal>
            <ExportAlert {...alertProps} />
        </PseudoModal>
    );
}
