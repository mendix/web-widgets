import { useState, useEffect } from "react";

interface StoreWithLifecycle {
    connected: () => (() => void) | void;
}

type Store = StoreWithLifecycle | object;

type Factory<T extends Store> = () => T;

export function useNewStore<T extends Store>(factory: Factory<T>): T {
    const [store] = useState(factory);

    useEffect(() => {
        if (Object.hasOwn(store, "connected")) {
            return (store as StoreWithLifecycle).connected();
        }
    }, [store]);

    return store;
}
