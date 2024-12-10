import { ReactElement, createElement } from "react";
import { FileDropperPreviewProps } from "../typings/FileDropperProps";
import classNames from "classnames";

export function preview(props: FileDropperPreviewProps): ReactElement {
    return (
        <div className={classNames(props.class, "widget-file-dropper")}>
            <div className={classNames("dropzone")}>
                <div className={"file-icon"} />
                <p className={"upload-text"}>{props.dropzoneIdleMessage}</p>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/FileDropper.scss");
}
