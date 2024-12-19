import { FileStatus } from "../stores/FileStore";
import { createElement, ReactElement } from "react";
import { useTranslationsStore } from "../utils/useTranslationsStore";

type UploadInfoProps = {
    status: FileStatus;
    error?: string;
};

export function UploadInfo({ status, error }: UploadInfoProps): ReactElement {
    const translations = useTranslationsStore();
    switch (status) {
        case "uploading":
            return <span className={"upload-status"}>{translations.get("uploadInProgressMessage")}</span>;
        case "done":
            return <span className={"upload-status success"}>{translations.get("uploadSuccessMessage")}</span>;
        case "uploadingError":
            return <span className={"upload-status error"}>{translations.get("uploadFailureGenericMessage")}</span>;
        case "validationError":
            return <span className={"upload-status error"}>{error}</span>;
        case "removedFile":
            return <span className={"upload-status error"}>{translations.get("removeSuccessMessage")}</span>;
        case "new":
        case "existingFile":
        default:
            return <span className={"upload-status"}></span>;
    }
}
