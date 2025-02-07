export interface ReactiveController {
    setup?(): (() => void) | void;
}

export interface ReactiveControllerHost {
    addController(controller: ReactiveController): void;

    removeController(controller: ReactiveController): void;

    setup(): () => void;
}
