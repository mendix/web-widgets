import Quill from "quill";
import { Dispatch, MutableRefObject, SetStateAction, useState } from "react";
import {
    viewCodeConfigType,
    type linkConfigType,
    type videoConfigType,
    type videoEmbedConfigType
} from "../../utils/formats";
import { type ChildDialogProps } from "../ModalDialog/Dialog";
import { type VideoFormType } from "../ModalDialog/VideoDialog";

type ModalReturnType = {
    showDialog: boolean;
    setShowDialog: Dispatch<SetStateAction<boolean>>;
    dialogConfig: ChildDialogProps;
    customLinkHandler(value: any): void;
    customVideoHandler(value: any): void;
    customViewCodeHandler(value: any): void;
};

export function useEmbedModal(ref: MutableRefObject<Quill | null>): ModalReturnType {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogConfig, setDialogConfig] = useState<ChildDialogProps>({});

    const closeDialog = (): void => {
        setShowDialog(false);
        setTimeout(() => ref.current?.focus(), 50);
    };
    const customLinkHandler = (value: any): void => {
        if (value === true) {
            setDialogConfig({
                dialogType: "link",
                config: {
                    onSubmit: (value: linkConfigType) => {
                        ref.current?.format("link", value);
                        closeDialog();
                    },
                    onClose: closeDialog
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            closeDialog();
        }
    };

    const customVideoHandler = (value: any): void => {
        if (value === true) {
            setDialogConfig({
                dialogType: "video",
                config: {
                    onSubmit: (value: VideoFormType) => {
                        // const currentValue = Object.hasOwn(value, "src") && (value as VideoFormTypeGeneral).src !== undefined ? value as VideoFormTypeGeneral : value as VideoFormTypeEmbed;;
                        if (Object.hasOwn(value, "src") && (value as videoConfigType).src !== undefined) {
                            const currentValue = value as videoConfigType;
                            ref.current?.format("video", currentValue);
                        } else {
                            const currentValue = value as videoEmbedConfigType;
                            const res = ref.current?.clipboard.convert({
                                html: currentValue.embedcode
                            });
                            if (res) {
                                ref.current?.updateContents(res);
                            }
                        }

                        closeDialog();
                    },
                    onClose: closeDialog
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            closeDialog();
        }
    };

    const customViewCodeHandler = (value: any): void => {
        if (value === true) {
            setDialogConfig({
                dialogType: "view-code",
                config: {
                    currentCode: ref.current?.getSemanticHTML(),
                    onSubmit: (value: viewCodeConfigType) => {
                        const newDelta = ref.current?.clipboard.convert({ html: value.src });
                        if (newDelta) {
                            ref.current?.setContents(newDelta, Quill.sources.USER);
                        }
                        closeDialog();
                    },
                    onClose: closeDialog
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            closeDialog();
        }
    };

    return {
        showDialog,
        setShowDialog,
        dialogConfig,
        customLinkHandler,
        customVideoHandler,
        customViewCodeHandler
    };
}
