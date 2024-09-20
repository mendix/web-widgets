import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { createElement, Fragment, ReactElement } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { MimeCheckFormat } from "../utils/allowedFormatChecker";

interface DropzoneProps {
    warningMessage?: string;
    onDrop: (files: File[], fileRejections: FileRejection[]) => void;
    maxSize: number;
    maxFilesPerUpload: number;
    acceptFileTypes: MimeCheckFormat;
}

export const Dropzone = observer(
    ({ warningMessage, onDrop, maxSize, maxFilesPerUpload, acceptFileTypes }: DropzoneProps): ReactElement => {
        const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
            onDrop,
            maxSize: maxSize || undefined,
            maxFiles: maxFilesPerUpload,
            accept: acceptFileTypes
        });

        const [type, msg] = getMessage(isDragAccept, isDragReject);

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
                <div className={classNames("dropzone-message")}>{warningMessage}</div>
            </Fragment>
        );
    }
);

type MessageType = "active" | "warning" | "idle";

function getMessage(isDragAccept: boolean, isDragReject: boolean): [MessageType, string] {
    if (isDragAccept) {
        return ["active", "Looks good! Drop files here!"];
    }
    if (isDragReject) {
        return ["warning", "Some files will be rejected."];
    }

    return ["idle", "Drag and drop files here"];
}
