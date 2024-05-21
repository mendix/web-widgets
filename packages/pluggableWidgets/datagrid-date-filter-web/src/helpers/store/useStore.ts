import { useReducer, useEffect, useMemo } from "react";

interface AbstractStore<S> extends EventTarget {
    state: S;
}

export function useStore<S, V>(store: AbstractStore<S>, map: (state: S) => V): V;
export function useStore<S>(store: AbstractStore<S>): AbstractStore<S>;
export function useStore<S, V>(store: AbstractStore<S>, map?: (state: S) => V): AbstractStore<S> | V {
    const [n, forceUpdate] = useReducer(n => n + 1, 0);

    useEffect(() => {
        store.addEventListener("change", forceUpdate);
        return () => store.removeEventListener("change", forceUpdate);
    }, [store]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => (map ? map(store.state) : store), [store, n]);
}
