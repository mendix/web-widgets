import classNames from "classnames";
import { ProgressBar } from "./ProgressBar";
import { UploadInfo } from "./UploadInfo";
import { createElement, ReactElement, useCallback, MouseEvent, KeyboardEvent, ReactNode } from "react";
import { FileStatus, FileStore } from "../stores/FileStore";
import { observer } from "mobx-react-lite";
import { FileIcon } from "./FileIcon";
import { fileSize } from "../utils/fileSize";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { ActionsBar } from "./ActionsBar";

interface FileEntryContainerProps {
    store: FileStore;
    actions?: FileUploaderContainerProps["customButtons"];
}

export const FileEntryContainer = observer(({ store, actions }: FileEntryContainerProps): ReactElement | null => {
    const defaultAction = actions?.find(a => {
        return a.buttonIsDefault;
    });

    const defaultListAction = defaultAction?.buttonActionFile ?? defaultAction?.buttonActionImage;

    const onDefaultAction = useCallback(() => {
        store.executeAction(defaultListAction);
    }, [store, defaultListAction]);

    if (store.fileStatus === "missing") {
        return null;
    }

    return (
        <FileEntry
            title={store.title}
            size={store.size}
            thumbnail={store.imagePreviewUrl}
            mimeType={store.mimeType}
            fileStatus={store.fileStatus}
            errorMessage={store.errorDescription}
            defaultAction={defaultListAction && store.canExecute(defaultListAction) ? onDefaultAction : undefined}
            actions={<ActionsBar actions={actions} store={store} />}
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

    defaultAction?: () => void;

    actions?: ReactNode;
}

function FileEntry(props: FileEntryProps): ReactElement {
    const { defaultAction } = props;

    const onClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            e.preventDefault();
            defaultAction?.();
        },
        [defaultAction]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.code === "Enter" || e.code === "Space") {
                e.stopPropagation();
                e.preventDefault();
                defaultAction?.();
            }
        },
        [defaultAction]
    );

    return (
        <div
            className={classNames("file-entry", {
                removed: props.fileStatus === "removedFile",
                invalid: props.fileStatus === "validationError"
            })}
            title={props.title}
            tabIndex={defaultAction ? 0 : undefined}
            onClick={defaultAction ? onClick : undefined}
            onKeyDown={defaultAction ? onKeyDown : undefined}
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

                {props.actions}
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
