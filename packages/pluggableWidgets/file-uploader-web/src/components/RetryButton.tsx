import { observer } from "mobx-react-lite";
import { MouseEvent, ReactElement, useCallback } from "react";
import { FileStore } from "../stores/FileStore";
import { useTranslationsStore } from "../utils/useTranslationsStore";

interface RetryButtonProps {
    store: FileStore;
}

export const RetryButton = observer(function RetryButton({ store }: RetryButtonProps): ReactElement {
    const translations = useTranslationsStore();

    const onClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            store.retry();
        },
        [store]
    );

    return (
        <button
            className="retry-button"
            disabled={!store.canRetry}
            onClick={onClick}
            title={translations.get("retryButtonTextMessage")}
        >
            <span className="retry-icon" aria-hidden />
        </button>
    );
});
