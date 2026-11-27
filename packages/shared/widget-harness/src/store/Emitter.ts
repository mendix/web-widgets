export type Listener = () => void;

export class Emitter {
    private listeners = new Set<Listener>();

    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    emit(): void {
        for (const listener of [...this.listeners]) {
            listener();
        }
    }
}
