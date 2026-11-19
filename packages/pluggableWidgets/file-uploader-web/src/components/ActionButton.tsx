import classNames from "classnames";
import { MouseEvent, ReactElement, useCallback } from "react";

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
            type="button"
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
