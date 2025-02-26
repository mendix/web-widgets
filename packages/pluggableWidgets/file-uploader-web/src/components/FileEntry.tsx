import classNames from "classnames";
import { ProgressBar } from "./ProgressBar";
import { UploadInfo } from "./UploadInfo";
import { createElement, ReactElement, useCallback, MouseEvent, KeyboardEvent } from "react";
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
            canDownload={store.canDownload}
            downloadUrl={store.downloadUrl}
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

    canDownload: boolean;
    downloadUrl?: string;
}

function FileEntry(props: FileEntryProps): ReactElement {
    const translations = useTranslationsStore();

    const { canDownload, downloadUrl, onRemove } = props;

    const onViewClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            e.preventDefault();
            onDownloadClick(downloadUrl);
        },
        [downloadUrl]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.code === "Enter" || e.code === "Space") {
                e.stopPropagation();
                e.preventDefault();
                onDownloadClick(downloadUrl);
            }
        },
        [downloadUrl]
    );

    const onRemoveClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onRemove();
        },
        [onRemove]
    );

    return (
        <div
            className={classNames("file-entry", {
                removed: props.fileStatus === "removedFile",
                invalid: props.fileStatus === "validationError"
            })}
            title={props.title}
            tabIndex={canDownload ? 0 : undefined}
            onClick={canDownload ? onViewClick : undefined}
            onKeyDown={canDownload ? onKeyDown : undefined}
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
                    {downloadUrl && <div className={"download-icon"} />}
                    <button
                        className={classNames("action-button", {
                            disabled: !props.canRemove
                        })}
                        onClick={onRemoveClick}
                        role={"button"}
                        title={translations.get("removeButtonTextMessage")}
                    >
                        <div className={"remove-icon"} />
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

function onDownloadClick(fileUrl: string | undefined): void {
    if (!fileUrl) {
        return;
    }
    const url = `${fileUrl}&target=window`;
    window.open(url, "mendix_file");
}
