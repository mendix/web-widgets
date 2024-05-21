import { useReducer, useEffect, useMemo } from "react";

interface EventTargetWithState<S> extends EventTarget {
    state: S;
}

export function useStore<S, V>(store: EventTargetWithState<S>, map: (state: S) => V): V;
export function useStore<S>(store: EventTargetWithState<S>): EventTargetWithState<S>;
export function useStore<S, V>(store: EventTargetWithState<S>, map?: (state: S) => V): EventTargetWithState<S> | V {
    const [n, forceUpdate] = useReducer(n => n + 1, 0);

    useEffect(() => {
        store.addEventListener("change", forceUpdate);
        return () => store.removeEventListener("change", forceUpdate);
    }, [store]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => (map ? map(store.state) : store), [store, n]);
}
