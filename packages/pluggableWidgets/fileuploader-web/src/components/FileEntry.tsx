import classNames from "classnames";
import { ProgressBar } from "./ProgressBar";
import { UploadInfo } from "./UploadInfo";
import { createElement, ReactElement } from "react";
import { FileStore } from "../stores/FileStore";
import { observer } from "mobx-react-lite";

interface FileEntryProps {
    store: FileStore;
}

export const FileEntry = observer(({ store }: FileEntryProps): ReactElement => {
    return (
        <div
            className={classNames("file-entry", {
                removed: store.fileStatus === "removedFile",
                invalid: store.fileStatus === "validationError"
            })}
            key={store.key}
        >
            <div className={"entry-preview"}>
                <div className={"doc-file-icon"}></div>
            </div>

            <div className={"entry-details"}>
                <div className={"entry-details-main"}>
                    <div className={"entry-details-name"}>{store.renderTitle()}</div>
                    <div className={"entry-details-size"}>{store.renderSize()}</div>
                    <div className={"entry-details-actions"}>
                        <button
                            className={classNames("remove-button", {
                                disabled: !store.canRemove
                            })}
                            onClick={() => store.remove()}
                            role={"button"}
                        >
                            &nbsp;
                        </button>
                    </div>
                </div>
                <div className={"entry-details-progress"}>
                    <ProgressBar visible={store.fileStatus === "uploading"} indeterminate />
                </div>
                <div className={"entry-details-upload-info"}>
                    <UploadInfo store={store} />
                </div>
            </div>
        </div>
    );
});
