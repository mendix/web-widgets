import { ReactElement, createElement } from "react";
import { FileUploaderPreviewProps } from "../typings/FileUploaderProps";
import classNames from "classnames";

export function preview(props: FileUploaderPreviewProps): ReactElement {
    return (
        <div className={classNames(props.class, "widget-file-uploader")}>
            <div className={classNames("dropzone")}>
                <div className={"file-icon"} />
                <p className={"upload-text"}>{props.dropzoneIdleMessage}</p>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/FileUploader.scss");
}
