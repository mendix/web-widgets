import { autorun, IAutorunOptions } from "mobx";

type Dispose = () => void;

type Effect = () => void | Dispose;

export function autoEffect(effect: Effect, options?: IAutorunOptions): Dispose {
    let cleanup: void | Dispose;

    const disposer = autorun(() => {
        // Cleanup previous effect if exists
        cleanup?.();
        // Run the effect and store the cleanup function
        cleanup = effect();
    }, options);

    return () => {
        disposer();
        cleanup?.();
    };
}
