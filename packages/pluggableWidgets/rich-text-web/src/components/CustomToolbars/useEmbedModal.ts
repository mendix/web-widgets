import type Quill from "quill";
import { useState, MutableRefObject, Dispatch, SetStateAction } from "react";
import { type ChildDialogProps } from "../ModalDialog/Dialog";
import { type linkConfigType, type videoConfigType, type videoEmbedConfigType } from "../../utils/formats";
import { type VideoFormType } from "../ModalDialog/VideoDialog";

type ModalReturnType = {
    showDialog: boolean;
    setShowDialog: Dispatch<SetStateAction<boolean>>;
    dialogConfig: ChildDialogProps;
    customLinkHandler(value: any): void;
    customVideoHandler(value: any): void;
};

export function useEmbedModal(ref: MutableRefObject<Quill | null>): ModalReturnType {
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogConfig, setDialogConfig] = useState<ChildDialogProps>({});

    const customLinkHandler = (value: any): void => {
        if (value === true) {
            setDialogConfig({
                dialogType: "link",
                config: {
                    onSubmit: (value: linkConfigType) => {
                        ref.current?.format("link", value);

                        setShowDialog(false);
                    },
                    onClose: () => setShowDialog(false)
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            setShowDialog(false);
        }
    };

    const customVideoHandler = (value: any): void => {
        if (value === true) {
            console.log("");
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

                        setShowDialog(false);
                    },
                    onClose: () => setShowDialog(false)
                }
            });
            setShowDialog(true);
        } else {
            ref.current?.format("link", false);
            setShowDialog(false);
        }
    };

    return {
        showDialog,
        setShowDialog,
        dialogConfig,
        customLinkHandler,
        customVideoHandler
    };
}
