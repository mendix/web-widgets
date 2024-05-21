import { useReducer, useEffect } from "react";

export function useStore<T extends EventTarget>(store: T): T {
    const [, forceUpdate] = useReducer(n => n + 1, 0);

    useEffect(() => {
        store.addEventListener("change", forceUpdate);
        return () => store.removeEventListener("change", forceUpdate);
    }, [store]);

    return store;
}
