import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ReactElement, useCallback } from "react";
import { FileRejection } from "react-dropzone";

import { Dropzone } from "./Dropzone";
import { FileEntryContainer } from "./FileEntry";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { prepareAcceptForDropzone } from "../utils/prepareAcceptForDropzone";
import { useRootStore } from "../utils/useRootStore";
import { useTranslationsStore } from "../utils/useTranslationsStore";

import "../ui/FileUploader.scss";

export const FileUploaderRoot = observer((props: FileUploaderContainerProps): ReactElement => {
    const rootStore = useRootStore();
    const translations = useTranslationsStore();

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            rootStore.processDrop(acceptedFiles, fileRejections);
        },
        [rootStore]
    );

    let warningMessage: string | undefined;
    if (rootStore.isFileUploadLimitReached) {
        warningMessage = translations.get("uploadLimitReachedMessage", rootStore.maxTotalFiles.toString());
    } else if (rootStore.createActionFailed) {
        warningMessage = translations.get("unavailableCreateActionMessage");
    } else if (rootStore.hasValidationErrors) {
        warningMessage = translations.get("dropzoneRejectedMessage");
    }

    return (
        <div className={classNames(props.class, "widget-file-uploader")} style={props.style}>
            {!rootStore.isReadOnly && (
                <Dropzone
                    onDrop={onDrop}
                    warningMessage={warningMessage}
                    maxSize={rootStore.maxFileSize}
                    acceptFileTypes={prepareAcceptForDropzone(rootStore.acceptedFileTypes)}
                    disabled={rootStore.isFileUploadLimitReached}
                />
            )}

            <div className={"files-list"}>
                {rootStore.sortedFiles.map(fileStore => {
                    return (
                        <FileEntryContainer
                            store={fileStore}
                            key={fileStore.key}
                            actions={props.enableCustomButtons ? props.customButtons : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
});
