import { createElement, MouseEvent, ReactElement, useCallback } from "react";
import classNames from "classnames";
import { ListActionValue } from "mendix";
import { FileStore } from "../stores/FileStore";

interface ActionButtonProps {
    icon: ReactElement;
    title?: string;
    action?: () => void;
    isDisabled: boolean;
}

export function ActionButton({ action, icon, title, isDisabled }: ActionButtonProps): ReactElement {
    const onClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            action?.();
        },
        [action]
    );
    return (
        <button
            role={"button"}
            className={classNames("action-button", {
                disabled: isDisabled
            })}
            onClick={onClick}
            title={title}
        >
            {icon}
        </button>
    );
}

interface FileActionButtonProps {
    store: FileStore;
    listAction?: ListActionValue;
    title?: string;
    icon: ReactElement;
}

export function FileActionButton({ listAction, store, title, icon }: FileActionButtonProps): ReactElement {
    const action = useCallback(() => {
        store.executeAction(listAction);
    }, [store, listAction]);

    return (
        <ActionButton
            icon={icon}
            title={title}
            action={action}
            isDisabled={!(!listAction || store.canExecute(listAction))}
        />
    );
}
