export interface ISetupable {
    setup(): void | (() => void);
}
