import classNames from "classnames";
import { ProgressBar } from "./ProgressBar";
import { UploadInfo } from "./UploadInfo";
import { createElement, ReactElement, useCallback } from "react";
import { FileStatus, FileStore } from "../stores/FileStore";
import { observer } from "mobx-react-lite";
import fileSize from "filesize.js";

interface FileEntryContainerProps {
    store: FileStore;
}

export const FileEntryContainer = observer(({ store }: FileEntryContainerProps): ReactElement => {
    const onRemove = useCallback(() => {
        store.remove();
    }, [store]);

    return (
        <FileEntry
            title={store.title}
            size={store.size}
            fileStatus={store.fileStatus}
            errorMessage={store.errorDescription}
            canRemove={store.canRemove}
            onRemove={onRemove}
        />
    );
});

interface FileEntryProps {
    title: string;
    size: number;

    fileStatus: FileStatus;
    errorMessage?: string;

    canRemove: boolean;
    onRemove: () => void;
}

function FileEntry(props: FileEntryProps): ReactElement {
    return (
        <div
            className={classNames("file-entry", {
                removed: props.fileStatus === "removedFile",
                invalid: props.fileStatus === "validationError"
            })}
        >
            <div className={"entry-preview"}>
                <div className={"doc-file-icon"}></div>
            </div>

            <div className={"entry-details"}>
                <div className={"entry-details-main"}>
                    <div className={"entry-details-name"}>{props.title}</div>
                    <div className={"entry-details-size"}>{props.size !== -1 && fileSize(props.size)}</div>
                    <div className={"entry-details-actions"}>
                        <button
                            className={classNames("remove-button", {
                                disabled: !props.canRemove
                            })}
                            onClick={props.onRemove}
                            role={"button"}
                        >
                            &nbsp;
                        </button>
                    </div>
                </div>
                <div className={"entry-details-progress"}>
                    <ProgressBar visible={props.fileStatus === "uploading"} indeterminate />
                </div>
                <div className={"entry-details-upload-info"}>
                    <UploadInfo status={props.fileStatus} error={props.errorMessage} />
                </div>
            </div>
        </div>
    );
}
