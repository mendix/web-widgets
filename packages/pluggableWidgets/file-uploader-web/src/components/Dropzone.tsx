import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { Fragment, ReactElement } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { TranslationsStore } from "../stores/TranslationsStore";
import { MimeCheckFormat } from "../utils/parseAllowedFormats";
import { useTranslationsStore } from "../utils/useTranslationsStore";

interface DropzoneProps {
    warningMessage?: string;
    onDrop: (files: File[], fileRejections: FileRejection[]) => void;
    maxSize: number;
    acceptFileTypes: MimeCheckFormat;
    disabled: boolean;
}

export const Dropzone = observer(
    ({ warningMessage, onDrop, maxSize, acceptFileTypes, disabled }: DropzoneProps): ReactElement => {
        const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
            onDrop,
            maxSize: maxSize || undefined,
            accept: acceptFileTypes,
            disabled
        });

        const translations = useTranslationsStore();
        const [type, msg] = getMessage(translations, isDragAccept, isDragReject);

        return (
            <Fragment>
                <div
                    className={classNames("dropzone", {
                        active: type === "active",
                        disabled,
                        warning: !!warningMessage || type === "warning"
                    })}
                    {...getRootProps()}
                >
                    <div className={"file-icon"} />
                    {!disabled && <p className={"upload-text"}>{msg}</p>}

                    {!disabled && <input {...getInputProps()} />}
                </div>
                {warningMessage && <div className={classNames("dropzone-message")}>{warningMessage}</div>}
            </Fragment>
        );
    }
);

type MessageType = "active" | "warning" | "idle";

function getMessage(
    translations: TranslationsStore,
    isDragAccept: boolean,
    isDragReject: boolean
): [MessageType, string] {
    if (isDragAccept) {
        return ["active", translations.get("dropzoneAcceptedMessage")];
    }
    if (isDragReject) {
        return ["warning", translations.get("dropzoneRejectedMessage")];
    }

    return ["idle", translations.get("dropzoneIdleMessage")];
}
