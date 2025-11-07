import mitt, { Emitter as MittEmitter } from "mitt";

export type Handler<T = unknown> = (event: T) => void;

export type WildcardHandler<T = Record<string, unknown>> = (type: keyof T, event: T[keyof T]) => void;

export interface Emitter<Events extends Record<string | symbol, unknown>> extends MittEmitter<Events> {
    on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): () => void;
    on(type: "*", handler: WildcardHandler<Events>): () => void;
}

export function createEmitter<Events extends Record<string | symbol, unknown>>(): Emitter<Events> {
    const emitter = mitt<Events>();

    return {
        ...emitter,
        on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]> | WildcardHandler<Events>): () => void {
            if (type === "*") {
                const fn = handler as WildcardHandler<Events>;
                emitter.on(type, fn);
                return () => emitter.off(type, fn);
            }
            const fn = handler as Handler<Events[Key]>;
            emitter.on(type, fn);
            return () => emitter.off(type, fn);
        }
    };
}
