import classNames from "classnames";
import { ProgressBar } from "./ProgressBar";
import { UploadInfo } from "./UploadInfo";
import { createElement, ReactElement, useCallback } from "react";
import { FileStatus, FileStore } from "../stores/FileStore";
import { observer } from "mobx-react-lite";
import fileSize from "filesize.js";
import { FileIcon } from "./FileIcon";
import { useTranslationsStore } from "../utils/useTranslationsStore";

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
            thumbnail={store.imagePreviewUrl}
            mimeType={store.mimeType}
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
    thumbnail?: string;
    mimeType: string;

    fileStatus: FileStatus;
    errorMessage?: string;

    canRemove: boolean;
    onRemove: () => void;
}

function FileEntry(props: FileEntryProps): ReactElement {
    const translations = useTranslationsStore();
    return (
        <div
            className={classNames("file-entry", {
                removed: props.fileStatus === "removedFile",
                invalid: props.fileStatus === "validationError"
            })}
        >
            <div className={"entry-details"}>
                <div
                    className={classNames("entry-details-preview", {
                        "preview-icon": !props.thumbnail
                    })}
                >
                    {props.thumbnail ? (
                        <img className={"image-preview"} src={props.thumbnail} alt="" />
                    ) : (
                        <FileIcon mimeType={props.mimeType} />
                    )}
                </div>

                <div className={"entry-details-main"}>
                    <div className={"entry-details-main-name"}>{props.title}</div>
                    <div className={"entry-details-main-size"}>{props.size !== -1 && fileSize(props.size)}</div>
                </div>

                <div className={"entry-details-actions"}>
                    <button
                        className={classNames("remove-button", {
                            disabled: !props.canRemove
                        })}
                        onClick={props.onRemove}
                        role={"button"}
                        title={translations.get("removeButtonTextMessage")}
                    >
                        &nbsp;
                    </button>
                </div>
            </div>
            <div className={"entry-progress"}>
                <ProgressBar visible={props.fileStatus === "uploading"} indeterminate />
            </div>
            <div className={"entry-upload-info"}>
                <UploadInfo status={props.fileStatus} error={props.errorMessage} />
            </div>
        </div>
    );
}
