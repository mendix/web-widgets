import { createElement, FC, ReactElement } from "react";
import * as Dialog from "@radix-ui/react-dialog";

type ProgressModalProps = {
    onCancel: () => void;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    progress: number;
    total?: number;
};

export const ProgressModal: FC<ProgressModalProps> = (props): ReactElement => {
    return (
        <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
            <Dialog.Overlay className="widget-datagrid-modal-overlay" />
            <Dialog.Content className="widget-datagrid-modal-content">
                <Dialog.Close className="widget-datagrid-modal-close" asChild>
                    Close button
                </Dialog.Close>
                {/* <Dialog.Title /> */}
                <Dialog.Description className="widget-datagrid-modal-description">
                    <p>{`${props.progress}${!!props.total && " / " + props.total}`}</p>
                </Dialog.Description>
                {/* <Dialog.Cancel /> */}
                {/* <Dialog.Action /> */}
            </Dialog.Content>
        </Dialog.Root>
    );
};
