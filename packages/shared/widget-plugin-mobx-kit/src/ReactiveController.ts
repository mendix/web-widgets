export interface ReactiveController {
    setup?(): (() => void) | void;
}
