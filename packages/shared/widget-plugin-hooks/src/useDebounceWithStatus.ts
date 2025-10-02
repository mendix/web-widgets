import { useCallback, useRef } from "react";

// this function will directly trigger function if action is not currently executing.
// if there are executing actions, it will delay the execution
// hence debounce based on executing status instead of pure timer.
export const useDebounceWithStatus = <F extends (...args: any[]) => any>(
    func: F,
    waitFor: number,
    isExecuting: boolean
): [F] => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingActions = useRef<Parameters<F>>();

    const abort = useCallback((): void => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const runPendingActions = useCallback(() => {
        abort();
        timeoutRef.current = setTimeout(() => {
            if (isExecuting) {
                runPendingActions();
            } else {
                // only run the last action
                const _args = pendingActions.current;
                if (_args) {
                    // clear previous actions.
                    pendingActions.current = undefined;
                    func(..._args);
                }
            }
        }, waitFor);
    }, [abort, func, waitFor, isExecuting]);

    const debounced = useCallback(
        (...args: Parameters<F>): void => {
            if (isExecuting) {
                pendingActions.current = args;
                runPendingActions();
            } else {
                func(...args);
            }
        },
        [runPendingActions, func, isExecuting]
    );
    return [debounced as F];
};
