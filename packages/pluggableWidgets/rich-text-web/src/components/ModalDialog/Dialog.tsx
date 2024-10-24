import {
    FloatingFocusManager,
    FloatingOverlay,
    FloatingPortal,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole
} from "@floating-ui/react";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { createElement, ReactElement } from "react";
import LinkDialog, { LinkDialogProps } from "./LinkDialog";
import VideoDialog, { VideoDialogProps } from "./VideoDialog";
import ViewCodeDialog, { ViewCodeDialogProps } from "./ViewCodeDialog";
import ImageDialog, { ImageDialogProps } from "./ImageDialog";
import "./Dialog.scss";

interface BaseDialogProps {
    isOpen: boolean;
    parentNode?: HTMLElement | null;
    onOpenChange?(open: boolean): void;
}

export type ImageDialogBaseProps = {
    dialogType?: "image";
    config?: ImageDialogProps;
};

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

export type ChildDialogProps =
    | LinkDialogBaseProps
    | VideoDialogBaseProps
    | ViewCodeDialogBaseProps
    | ImageDialogBaseProps;

export type DialogProps = BaseDialogProps & ChildDialogProps;

/**
 * Dialog components that will be shown on toolbar's button
 */
export default function Dialog(props: DialogProps): ReactElement {
    const { isOpen, onOpenChange, dialogType, config } = props;
    const { refs, context } = useFloating({
        open: isOpen,
        onOpenChange
    });

    const click = useClick(context);
    const dismiss = useDismiss(context, {
        outsidePressEvent: "mousedown"
    });
    const role = useRole(context);

    const { getFloatingProps } = useInteractions([click, dismiss, role]);

    return (
        <FloatingPortal>
            {isOpen && (
                <FloatingOverlay lockScroll className="widget-rich-text-modal-overlay">
                    <FloatingFocusManager context={context}>
                        <div
                            className="Dialog"
                            ref={refs.setFloating}
                            aria-labelledby={dialogType}
                            aria-describedby={dialogType}
                            {...getFloatingProps()}
                        >
                            <If condition={dialogType === "link"}>
                                <LinkDialog {...(config as LinkDialogProps)}></LinkDialog>
                            </If>
                            <If condition={dialogType === "video"}>
                                <VideoDialog {...(config as VideoDialogProps)}></VideoDialog>
                            </If>
                            <If condition={dialogType === "view-code"}>
                                <ViewCodeDialog {...(config as ViewCodeDialogProps)}></ViewCodeDialog>
                            </If>
                            <If condition={dialogType === "image"}>
                                <ImageDialog {...(config as ImageDialogProps)}></ImageDialog>
                            </If>
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            )}
        </FloatingPortal>
    );
}
