import { createEmitter } from "../src/lib/createEmitter";

describe("createEmitter", () => {
    it("should emit and handle events", () => {
        type Events = {
            click: { x: number; y: number };
            change: string;
        };

        const emitter = createEmitter<Events>();
        const handler = jest.fn();

        emitter.on("click", handler);
        emitter.emit("click", { x: 10, y: 20 });

        expect(handler).toHaveBeenCalledWith({ x: 10, y: 20 });
    });

    it("should return unsubscribe function", () => {
        type Events = {
            update: number;
        };

        const emitter = createEmitter<Events>();
        const handler = jest.fn();

        const unsubscribe = emitter.on("update", handler);
        emitter.emit("update", 42);
        expect(handler).toHaveBeenCalledTimes(1);

        unsubscribe();
        emitter.emit("update", 99);
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle wildcard events", () => {
        type Events = {
            foo: string;
            bar: number;
        };

        const emitter = createEmitter<Events>();
        const wildcard = jest.fn();

        emitter.on("*", wildcard);
        emitter.emit("foo", "test");
        emitter.emit("bar", 123);

        expect(wildcard).toHaveBeenCalledTimes(2);
        expect(wildcard).toHaveBeenCalledWith("foo", "test");
        expect(wildcard).toHaveBeenCalledWith("bar", 123);
    });

    it("should support multiple handlers for same event", () => {
        type Events = {
            save: boolean;
        };

        const emitter = createEmitter<Events>();
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        emitter.on("save", handler1);
        emitter.on("save", handler2);
        emitter.emit("save", true);

        expect(handler1).toHaveBeenCalledWith(true);
        expect(handler2).toHaveBeenCalledWith(true);
    });

    it("should unsubscribe wildcard handler", () => {
        type Events = {
            a: number;
            b: string;
        };

        const emitter = createEmitter<Events>();
        const wildcard = jest.fn();

        const unsubscribe = emitter.on("*", wildcard);
        emitter.emit("a", 1);
        expect(wildcard).toHaveBeenCalledTimes(1);

        unsubscribe();
        emitter.emit("b", "test");
        expect(wildcard).toHaveBeenCalledTimes(1);
    });
});
