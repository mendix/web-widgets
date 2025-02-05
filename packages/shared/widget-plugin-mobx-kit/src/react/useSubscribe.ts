import { IReactionOptions, reaction } from "mobx";
import { useEffect, useState } from "react";

export function useSubscribe<Store extends object, T, FireImmediately extends boolean = false>(
    init: Store | (() => Store),
    selector: (store: Store) => T,
    options?: IReactionOptions<T, FireImmediately>
): [T, Store] {
    const [store] = useState(() => (typeof init === "function" ? init() : init));
    const [value, setValue] = useState(() => selector(store));

    function setup(): () => void {
        return reaction(() => selector(store), setValue, options);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(setup, []);

    return [value, store];
}
