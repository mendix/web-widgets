export interface SetupComponent {
    setup(): (() => void) | void;
}
