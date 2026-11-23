import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ReactElement, useCallback } from "react";
import { ActionButton } from "./ActionButton";
import { FileIcon } from "./FileIcon";
import { ProgressBar } from "./ProgressBar";
import { UploadInfo } from "./UploadInfo";
import { FileStore } from "../stores/FileStore";
import { fileSize } from "../utils/fileSize";
import { useRootStore } from "../utils/useRootStore";
import { useTranslationsStore } from "../utils/useTranslationsStore";

interface FileEntryContainerProps {
    store: FileStore;
}

export const FileEntryContainer = observer(({ store }: FileEntryContainerProps): ReactElement => {
    const rootStore = useRootStore();
    const translations = useTranslationsStore();

    const onRemove = useCallback(() => {
        if (store.canDismiss) {
            rootStore.dismissFile(store);
        } else {
            rootStore.removeFile(store);
        }
    }, [rootStore, store]);

    const onUpload = useCallback(() => {
        rootStore.uploadFile(store);
    }, [rootStore, store]);

    const showRemove = store.canDismiss || rootStore.canRemove(store);
    const showUpload = rootStore.canUploadFile(store);

    return (
        <div
            className={classNames("file-entry", {
                invalid: store.fileStatus === "validationError"
            })}
            title={store.title}
        >
            <div className={"entry-details"}>
                <div className={"entry-details-preview preview-icon"}>
                    <FileIcon mimeType={store.mimeType} />
                </div>

                <div className={"entry-details-main"}>
                    <div className={"entry-details-main-name"}>{store.title}</div>
                    <div className={"entry-details-main-size"}>{fileSize(store.size)}</div>
                </div>

                {(showUpload || showRemove) && (
                    <div className={"entry-details-actions"}>
                        {showUpload && (
                            <ActionButton
                                icon={<span className={"file-action-icon glyphicon glyphicon-upload"} aria-hidden />}
                                title={translations.get("uploadButtonTextMessage")}
                                action={onUpload}
                                isDisabled={false}
                            />
                        )}
                        {showRemove && (
                            <ActionButton
                                icon={<span className={"remove-icon"} aria-hidden />}
                                title={translations.get("removeButtonTextMessage")}
                                action={onRemove}
                                isDisabled={false}
                            />
                        )}
                    </div>
                )}
            </div>
            <div className={"entry-progress"}>
                <ProgressBar visible={["creating", "removing", "uploading"].includes(store.fileStatus)} indeterminate />
            </div>
            <div className={"entry-upload-info"}>
                <UploadInfo status={store.fileStatus} error={store.errorDescription} />
            </div>
        </div>
    );
});
