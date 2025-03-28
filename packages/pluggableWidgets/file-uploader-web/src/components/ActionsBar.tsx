import { createElement, ReactElement, useCallback } from "react";
import { FileUploaderContainerProps } from "../../typings/FileUploaderProps";
import { ActionButton, FileActionButton } from "./ActionButton";
import { IconInternal } from "@mendix/widget-plugin-component-kit/IconInternal";
import { FileStore } from "../stores/FileStore";
import { useTranslationsStore } from "../utils/useTranslationsStore";

interface ButtonsBarProps {
    actions?: FileUploaderContainerProps["customButtons"];
    store: FileStore;
}

export const ActionsBar = ({ actions, store }: ButtonsBarProps): ReactElement | null => {
    if (!actions) {
        return <DefaultActionsBar store={store} />;
    }

    if (actions && store.canExecuteActions) {
        return (
            <div className={"entry-details-actions"}>
                {actions.map(a => {
                    if (!a.buttonIsVisible.value) {
                        return null;
                    }
                    const listAction = a.buttonActionImage ?? a.buttonActionFile;

                    return (
                        <FileActionButton
                            icon={<IconInternal icon={a.buttonIcon.value} className={"file-action-icon"} />}
                            title={a.buttonCaption.value}
                            store={store}
                            listAction={listAction}
                        />
                    );
                })}
            </div>
        );
    }

    return null;
};

function DefaultActionsBar(props: ButtonsBarProps) {
    const translations = useTranslationsStore();

    const onRemove = useCallback(() => {
        props.store.remove();
    }, [props.store]);

    const onViewClick = useCallback(() => {
        onDownloadClick(props.store.downloadUrl);
    }, [props.store.downloadUrl]);

    return (
        <div className={"entry-details-actions"}>
            <ActionButton
                icon={<div className={"download-icon"} />}
                title={translations.get("downloadButtonTextMessage")}
                action={onViewClick}
                isDisabled={!props.store.canDownload}
            />
            <ActionButton
                icon={<div className={"remove-icon"} />}
                title={translations.get("removeButtonTextMessage")}
                action={onRemove}
                isDisabled={!props.store.canRemove}
            />
        </div>
    );
}

function onDownloadClick(fileUrl: string | undefined): void {
    if (!fileUrl) {
        return;
    }
    const url = `${fileUrl}&target=window`;
    window.open(url, "mendix_file");
}
