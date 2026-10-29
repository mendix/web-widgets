import { reaction } from "mobx";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes a component to a MobX derivation without exposing MobX to it.
 *
 * `read` must return a stable value while nothing changed: a primitive, or a `computed` that
 * caches its result. That is the contract `useSyncExternalStore` needs to skip re-renders.
 * The design docs call this the snapshot hook; in step 2 it reads the ViewModel.
 */
export function useObservableSnapshot<T>(read: () => T): T {
    const subscribe = useCallback((onChange: () => void) => reaction(read, onChange), [read]);
    return useSyncExternalStore(subscribe, read, read);
}
