import { useState, useCallback } from "react";

type ErrorCb<E extends Error = Error> = (error: E) => void;

type UseCustomErrorMessageHook = () => [string | null, ErrorCb];

function getErrorMessage<E extends Error>(error: E): string | null {
    if (error instanceof Error) {
        return `Error in barcode scanner: ${error.message}`;
    }

    return "Error in barcode scanner: an unexpected error.";
}

export const useCustomErrorMessage: UseCustomErrorMessageHook = () => {
    const [message, setMessage] = useState<string | null>(null);
    const setError = useCallback<ErrorCb>(error => {
        setMessage(getErrorMessage(error));
    }, []);
    return [message, setError];
};
