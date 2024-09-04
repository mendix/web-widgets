import { If } from "@mendix/widget-plugin-component-kit/If";
import { createElement, ReactElement } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import "./Dialog.scss";
import LinkDialog, { LinkDialogProps } from "./LinkDialog";
import VideoDialog, { VideoDialogProps } from "./VideoDialog";
import ViewCodeDialog, { ViewCodeDialogProps } from "./ViewCodeDialog";

interface BaseDialogProps {
    isOpen: boolean;
    parentNode?: HTMLElement | null;
    onOpenChange?(open: boolean): void;
}

export type ViewCodeDialogBaseProps = {
    dialogType?: "view-code";
    config?: ViewCodeDialogProps;
};

export type LinkDialogBaseProps = {
    dialogType?: "link";
    config?: LinkDialogProps;
};

export type VideoDialogBaseProps = {
    dialogType?: "video";
    config?: VideoDialogProps;
};

export type ChildDialogProps = LinkDialogBaseProps | VideoDialogBaseProps | ViewCodeDialogBaseProps;

export type DialogProps = BaseDialogProps & ChildDialogProps;

export default function Dialog(props: DialogProps): ReactElement {
    const { isOpen, onOpenChange, dialogType, config } = props;
    return (
        <RadixDialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="widget-rich-text-modal-overlay" />
                <If condition={dialogType === "link"}>
                    <LinkDialog {...(config as LinkDialogProps)}></LinkDialog>
                </If>
                <If condition={dialogType === "video"}>
                    <VideoDialog {...(config as VideoDialogProps)}></VideoDialog>
                </If>
                <If condition={dialogType === "view-code"}>
                    <ViewCodeDialog {...(config as ViewCodeDialogProps)}></ViewCodeDialog>
                </If>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
}
