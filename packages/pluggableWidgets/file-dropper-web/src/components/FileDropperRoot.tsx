import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { createElement, ReactElement, useCallback } from "react";
import { FileRejection } from "react-dropzone";

import { FileDropperContainerProps } from "../../typings/FileDropperProps";
import { prepareAcceptForDropzone } from "../utils/prepareAcceptForDropzone";
import { useRootStore } from "../utils/useRootStore";
import { FileEntryContainer } from "./FileEntry";
import { Dropzone } from "./Dropzone";

import "../ui/FileDropper.scss";

export const FileDropperRoot = observer((props: FileDropperContainerProps): ReactElement => {
    const rootStore = useRootStore(props);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            rootStore.processDrop(acceptedFiles, fileRejections);
        },
        [rootStore]
    );

    return (
        <div className={classNames(props.class, "widget-file-dropper")} style={props.style}>
            <Dropzone
                onDrop={onDrop}
                warningMessage={rootStore.errorMessage}
                maxSize={rootStore._maxFileSize}
                acceptFileTypes={prepareAcceptForDropzone(rootStore.acceptedFileTypes)}
                maxFilesPerUpload={rootStore._maxFilesPerUpload}
                translations={rootStore.translations}
            />

            <div className={"files-list"}>
                {(rootStore.files ?? []).map(fileStore => {
                    return <FileEntryContainer store={fileStore} key={fileStore.key} />;
                })}
            </div>
        </div>
    );
});
