import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { createElement, ReactElement, useCallback } from "react";

import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { useRootStore } from "../utils/useRootStore";

import "../ui/FileUploader.css";
import { FileEntry } from "./FileEntry";
import { Dropzone } from "./Dropzone";
import { FileRejection } from "react-dropzone";

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
            <Dropzone
                onDrop={onDrop}
                warningMessage={rootStore.errorMessage}
                maxSize={rootStore._maxFileSize}
                acceptFileTypes={rootStore.acceptedFileTypes}
                maxFilesPerUpload={rootStore._maxFilesPerUpload}
            />

            <div className={"files-list"}>
                {(rootStore.files ?? []).map(fileStore => {
                    return <FileEntry store={fileStore} key={fileStore.key} />;
                })}
            </div>
        </div>
    );
});
