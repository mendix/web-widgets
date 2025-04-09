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
                {actions.map((a, i) => {
                    if (!a.buttonIsVisible.value) {
                        return null;
                    }
                    const listAction = a.buttonActionImage ?? a.buttonActionFile;

                    return (
                        <FileActionButton
                            key={i}
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

function DefaultActionsBar(props: ButtonsBarProps): ReactElement {
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
                icon={<span className={"download-icon"} aria-hidden />}
                title={translations.get("downloadButtonTextMessage")}
                action={onViewClick}
                isDisabled={!props.store.canDownload}
            />
            <ActionButton
                icon={<span className={"remove-icon"} aria-hidden />}
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
    const url = new URL(fileUrl);
    url.searchParams.append("target", "window");

    window.open(url, "mendix_file");
}
