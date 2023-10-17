import { createElement, FC, ReactElement } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { CloseIcon } from "./icons/CloseIcon";
import { WarningIcon } from "./icons/WarningIcon";

type ProgressModalProps = {
    failed?: boolean;
    onCancel: () => void;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    progress: number;
    total?: number;
};

export const ProgressModal: FC<ProgressModalProps> = (props): ReactElement => {
    const isPercentage = new Boolean(props.total);
    const modalContent = isPercentage ? `${props.progress} / ${props.total}` : props.progress;

    return (
        <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
            <Dialog.Overlay className="widget-datagrid-modal-overlay">
                <Dialog.Content className="widget-datagrid-modal-content">
                    <Dialog.Close className="widget-datagrid-modal-close" asChild>
                        <button
                            className="btn btn-image btn-icon close-button"
                            onClick={() => props.onOpenChange(false)}
                        >
                            <CloseIcon />
                        </button>
                    </Dialog.Close>
                    {/* <Dialog.Title /> */}
                    <Dialog.Description className="widget-datagrid-modal-description">
                        {props.failed ? (
                            <div className="widget-datagrid-modal-warning">
                                <WarningIcon />
                            </div>
                        ) : (
                            <p>{modalContent}</p>
                        )}
                    </Dialog.Description>
                    {/* <Dialog.Cancel /> */}
                    {/* <Dialog.Action /> */}
                </Dialog.Content>
            </Dialog.Overlay>
        </Dialog.Root>
    );
};
