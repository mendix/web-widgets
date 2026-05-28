import { ReactElement } from "react";
import { FileStatus } from "../stores/FileStore";
import { useRootStore } from "../utils/useRootStore";
import { useTranslationsStore } from "../utils/useTranslationsStore";

type UploadInfoProps = {
    status: FileStatus;
    error?: string;
};

export function UploadInfo({ status, error }: UploadInfoProps): ReactElement {
    const translations = useTranslationsStore();
    const rootStore = useRootStore();
    switch (status) {
        case "uploading":
            return <span className={"upload-status"}>{translations.get("uploadInProgressMessage")}</span>;
        case "done":
            return <span className={"upload-status success"}>{translations.get("uploadSuccessMessage")}</span>;
        case "uploadingError":
            return <span className={"upload-status error"}>{translations.get("uploadFailureGenericMessage")}</span>;
        case "rejected":
            return (
                <span className={"upload-status error"}>
                    {translations.get("uploadLimitReachedMessage", rootStore.maxTotalFiles.toString())}
                </span>
            );
        case "validationError":
            return <span className={"upload-status error"}>{error}</span>;
        case "removedFile":
            return <span className={"upload-status error"}>{translations.get("removeSuccessMessage")}</span>;
        case "queued":
            return <span className={"upload-status"}>{translations.get("uploadQueuedMessage")}</span>;
        case "existingFile":
        default:
            return <span className={"upload-status"}></span>;
    }
}
