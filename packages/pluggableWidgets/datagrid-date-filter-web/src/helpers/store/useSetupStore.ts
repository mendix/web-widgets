import { useState, useEffect } from "react";
import { FilterStore } from "./FilterStore";

export function useSetupStore(initState?: () => FilterStore["state"]): FilterStore {
    const [store] = useState(() => new FilterStore(initState?.()));

    useEffect(() => store.connected(), [store]);

    return store;
}
