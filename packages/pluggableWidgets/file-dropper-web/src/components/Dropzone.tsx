import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { createElement, Fragment, ReactElement } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { MimeCheckFormat } from "../utils/parseAllowedFormats";
import { TranslationsStore } from "../stores/TranslationsStore";

interface DropzoneProps {
    warningMessage?: string;
    onDrop: (files: File[], fileRejections: FileRejection[]) => void;
    maxSize: number;
    maxFilesPerUpload: number;
    acceptFileTypes: MimeCheckFormat;
    translations: TranslationsStore;
}

export const Dropzone = observer(
    ({
        warningMessage,
        onDrop,
        maxSize,
        maxFilesPerUpload,
        acceptFileTypes,
        translations
    }: DropzoneProps): ReactElement => {
        const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
            onDrop,
            maxSize: maxSize || undefined,
            maxFiles: maxFilesPerUpload,
            accept: acceptFileTypes
        });

        const [type, msg] = getMessage(translations, isDragAccept, isDragReject);

        return (
            <Fragment>
                <div
                    className={classNames("dropzone", {
                        active: type === "active",
                        warning: !!warningMessage || type === "warning"
                    })}
                    {...getRootProps()}
                >
                    <div className={"file-icon"} />
                    <p className={"upload-text"}>{msg}</p>

                    <input {...getInputProps()} />
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
