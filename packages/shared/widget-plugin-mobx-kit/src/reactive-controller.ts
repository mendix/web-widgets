/** @deprecated Use `SetupLifecycle` instead. */
export interface ReactiveController {
    setup?(): (() => void) | void;
}

export interface SetupLifecycle {
    /**
     * Called once when host is mounted.
     * `setup` can return optional "cleanup" function.
     */
    setup(): (() => void) | void;
}

/** @deprecated Use `SetupLifecycleHost` instead. */
export interface ReactiveControllerHost {
    addController(controller: ReactiveController): void;
    removeController(controller: ReactiveController): void;
    setup(): () => void;
}

export interface SetupLifecycleHost {
    addNode(node: SetupLifecycle): void;
    removeNode(node: SetupLifecycle): void;
    setup(): () => void;
}
