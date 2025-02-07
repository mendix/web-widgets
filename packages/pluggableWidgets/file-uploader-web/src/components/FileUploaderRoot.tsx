import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { createElement, ReactElement, useCallback } from "react";
import { FileRejection } from "react-dropzone";

import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { prepareAcceptForDropzone } from "../utils/prepareAcceptForDropzone";
import { useRootStore } from "../utils/useRootStore";
import { FileEntryContainer } from "./FileEntry";
import { Dropzone } from "./Dropzone";

import "../ui/FileUploader.scss";

export const FileUploaderRoot = observer((props: FileUploaderContainerProps): ReactElement => {
    const rootStore = useRootStore(props);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            rootStore.processDrop(acceptedFiles, fileRejections);
        },
        [rootStore]
    );

    return (
        <div className={classNames(props.class, "widget-file-uploader")} style={props.style}>
            {!rootStore.isReadOnly && (
                <Dropzone
                    onDrop={onDrop}
                    warningMessage={rootStore.errorMessage}
                    maxSize={rootStore._maxFileSize}
                    acceptFileTypes={prepareAcceptForDropzone(rootStore.acceptedFileTypes)}
                    maxFilesPerUpload={rootStore._maxFilesPerUpload}
                />
            )}

            <div className={"files-list"}>
                {(rootStore.files ?? []).map(fileStore => {
                    return <FileEntryContainer store={fileStore} key={fileStore.key} />;
                })}
            </div>
        </div>
    );
});
