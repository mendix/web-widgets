import { ReactElement } from "react";
import { FileStatus } from "../stores/FileStore";
import { useTranslationsStore } from "../utils/useTranslationsStore";

type UploadInfoProps = {
    status: FileStatus;
    error?: string;
    maxTotalFiles: number;
};

export function UploadInfo({ status, error, maxTotalFiles }: UploadInfoProps): ReactElement {
    const translations = useTranslationsStore();
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
                    {translations.get("uploadLimitReachedMessage", maxTotalFiles.toString())}
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
