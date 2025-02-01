import { configure, observable } from "mobx";
import { autoEffect } from "../src/autoEffect";

describe("autoEffect", () => {
    configure({
        enforceActions: "never"
    });

    it("should run the effect immediately", () => {
        const mockEffect = jest.fn();
        autoEffect(mockEffect);

        expect(mockEffect).toHaveBeenCalledTimes(1);
    });

    it("should run the cleanup function when the effect is re-run", () => {
        const cleanup = jest.fn();
        const observableValue = observable.box(0);
        const mockEffect = jest.fn(() => {
            observableValue.get(); // Track the observable
            return cleanup;
        });

        autoEffect(mockEffect);
        expect(mockEffect).toHaveBeenCalledTimes(1);
        expect(cleanup).not.toHaveBeenCalled();

        // Change the observable to trigger the effect again
        observableValue.set(1);

        expect(mockEffect).toHaveBeenCalledTimes(2);
        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("should call the cleanup function when disposed", () => {
        const cleanup = jest.fn();
        const mockEffect = jest.fn().mockReturnValue(cleanup);

        const disposer = autoEffect(mockEffect);

        expect(mockEffect).toHaveBeenCalledTimes(1);
        expect(cleanup).not.toHaveBeenCalled();

        // Dispose the effect
        disposer();

        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("should respect autorun options", () => {
        jest.useFakeTimers();
        const observableValue = observable.box(0);
        const mockEffect = jest.fn(() => {
            observableValue.get(); // Track the observable
        });

        // Test throttling
        autoEffect(mockEffect, { delay: 100 });
        // Fast-forward time
        jest.advanceTimersByTime(100);

        expect(mockEffect).toHaveBeenCalledTimes(1);

        // Change the observable to trigger the effect again
        observableValue.set(1);
        observableValue.set(2);
        observableValue.set(3);
        // Fast-forward time
        jest.advanceTimersByTime(100);

        expect(mockEffect).toHaveBeenCalledTimes(2);

        jest.useRealTimers();
    });
});
