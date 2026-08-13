import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { TranslationsStore } from "../stores/TranslationsStore";
import { MimeCheckFormat } from "../utils/parseAllowedFormats";
import { useTranslationsStore } from "../utils/useTranslationsStore";

interface DropzoneProps {
    warningMessage?: string;
    statusMessage?: string;
    onDrop: (files: File[], fileRejections: FileRejection[]) => void;
    maxSize: number;
    acceptFileTypes: MimeCheckFormat;
    disabled: boolean;
}

export const Dropzone = observer(
    ({ warningMessage, statusMessage, onDrop, maxSize, acceptFileTypes, disabled }: DropzoneProps): ReactElement => {
        const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
            onDrop,
            maxSize: maxSize || undefined,
            accept: acceptFileTypes,
            disabled
        });

        const translations = useTranslationsStore();
        const [type, msg, icon] = getMessage(
            translations,
            isDragActive && isDragAccept,
            isDragActive && isDragReject,
            warningMessage,
            statusMessage
        );

        return (
            <div
                className={classNames("dropzone", {
                    active: type === "active",
                    disabled,
                    warning: type === "warning"
                })}
                {...getRootProps()}
            >
                <div className={"file-icon"} />
                <p className={"upload-text"}>
                    {icon && <span className={classNames("inline-icon", icon)} />}
                    {msg}
                </p>

                {!disabled && <input {...getInputProps()} />}
            </div>
        );
    }
);

type MessageType = "active" | "warning" | "idle";
type IconType = "warning-icon" | null;

function getMessage(
    translations: TranslationsStore,
    isDragAccept: boolean,
    isDragReject: boolean,
    warningMessage?: string,
    statusMessage?: string
): [MessageType, string, IconType] {
    if (isDragAccept) {
        return ["active", translations.get("dropzoneAcceptedMessage"), null];
    }
    if (isDragReject) {
        return ["warning", translations.get("dropzoneRejectedMessage"), "warning-icon"];
    }
    if (warningMessage) {
        return ["warning", warningMessage, "warning-icon"];
    }
    if (statusMessage) {
        return ["idle", statusMessage, null];
    }

    return ["idle", translations.get("dropzoneIdleMessage"), null];
}
