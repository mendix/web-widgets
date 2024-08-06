import { If } from "@mendix/widget-plugin-component-kit/If";
import { createElement, ReactElement } from "react";
import Modal from "react-modal";
import "./Dialog.scss";
import LinkDialog, { LinkDialogProps } from "./LinkDialog";
import VideoDialog, { VideoDialogProps } from "./VideoDialog";

interface BaseDialogProps {
    isOpen: boolean;
    parentNode?: HTMLElement | null;
    onClose?(event: React.MouseEvent | React.KeyboardEvent): void;
}

export type LinkDialogBaseProps = {
    dialogType?: "link";
    config?: LinkDialogProps;
};

export type VideoDialogBaseProps = {
    dialogType?: "video";
    config?: VideoDialogProps;
};

export type ChildDialogProps = LinkDialogBaseProps | VideoDialogBaseProps;

export type DialogProps = BaseDialogProps & ChildDialogProps;

export default function Dialog(props: DialogProps): ReactElement {
    const { isOpen, onClose, dialogType, config } = props;
    return (
        <Modal
            isOpen={isOpen}
            // parentSelector={() => parentNode ?? document.body}
            overlayClassName={"widget-rich-text-modal-overlay"}
            className={"widget-rich-text-modal modal-dialog"}
            // style={{ overlay: { position: "absolute" }, content: { width: "fit-content", padding: 0 } }}
            onRequestClose={onClose}
            appElement={document.body}
            portalClassName={`widget-rich-text-modal-container`}
        >
            <If condition={dialogType === "link"}>
                <LinkDialog {...(config as LinkDialogProps)}></LinkDialog>
            </If>
            <If condition={dialogType === "video"}>
                <VideoDialog {...(config as VideoDialogProps)}></VideoDialog>
            </If>
        </Modal>
    );
}
