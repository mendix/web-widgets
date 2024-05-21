import { useState, useEffect } from "react";

interface Store {
    connected?: () => void;
}

type Factory<T extends Store> = () => T;

export function useNewStore<T extends Store>(factory: Factory<T>): T {
    const [store] = useState(factory);

    useEffect(() => store.connected?.(), [store]);

    return store;
}
