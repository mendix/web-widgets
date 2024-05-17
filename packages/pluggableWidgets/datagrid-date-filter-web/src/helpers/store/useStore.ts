import { useReducer, useEffect } from "react";
import { FilterStore } from "./FilterStore";

export function useStore(store: FilterStore): FilterStore {
    const [, forceUpdate] = useReducer(n => n + 1, 0);

    useEffect(() => {
        store.addEventListener("change", forceUpdate);
        return () => store.removeEventListener("change", forceUpdate);
    }, [store]);

    return store;
}
