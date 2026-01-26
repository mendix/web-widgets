import { TimerExecutor } from "../TimerExecutor";

describe("TimerExecutor", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe("Basic functionality", () => {
        it("should start in idle state", () => {
            const executor = new TimerExecutor();
            expect(executor.isReady).toBe(false);
        });

        it("should become ready after setting params", () => {
            const executor = new TimerExecutor();
            executor.setParams(1000, undefined, false);
            expect(executor.isReady).toBe(true);
        });

        it("should require interval when repeat is true", () => {
            const executor = new TimerExecutor();
            executor.setParams(1000, undefined, true);
            expect(executor.isReady).toBe(false);

            executor.setParams(1000, 2000, true);
            expect(executor.isReady).toBe(true);
        });
    });

    describe("Single execution (non-repeating)", () => {
        it("should execute callback after delay when canExecute is true", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            // Setup
            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            // Fast-forward time
            jest.advanceTimersByTime(1200);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("should not execute callback if canExecute is false", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, false);

            jest.advanceTimersByTime(1200);

            expect(callback).not.toHaveBeenCalled();
        });

        it("should wait for canExecute to become true before executing", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, false);

            // Timer fires but canExecute is false
            jest.advanceTimersByTime(1200);
            expect(callback).not.toHaveBeenCalled();

            // canExecute becomes true
            executor.setCallback(callback, true);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("should transition through states: idle -> scheduled -> pending -> invoking -> executing -> completed", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            // idle state
            expect(executor.isReady).toBe(false);

            // idle -> scheduled
            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            // scheduled -> pending -> invoking (after timer fires)
            jest.advanceTimersByTime(1200);
            expect(callback).toHaveBeenCalledTimes(1);

            // invoking -> executing (canExecute goes false)
            executor.setCallback(callback, false);

            // executing -> completed (canExecute goes true)
            executor.setCallback(callback, true);

            // Should not execute again (completed state)
            jest.advanceTimersByTime(10000);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe("Repeated execution", () => {
        it("should execute callback repeatedly with interval", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, 2000, true);
            executor.setCallback(callback, true);

            // First execution after delay
            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(1);

            // Simulate action execution cycle
            executor.setCallback(callback, false); // Action starts
            executor.setCallback(callback, true); // Action completes

            // Still no second execution
            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(1);

            // Second execution after interval
            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(2);

            // Simulate action execution cycle
            executor.setCallback(callback, false);
            executor.setCallback(callback, true);

            // Third execution after interval
            jest.advanceTimersByTime(2100);
            expect(callback).toHaveBeenCalledTimes(3);
        });

        it("should use delay for first execution and interval for subsequent", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(500, 2000, true);
            executor.setCallback(callback, true);

            // First: 500ms
            jest.advanceTimersByTime(510);
            expect(callback).toHaveBeenCalledTimes(1);

            executor.setCallback(callback, false);
            executor.setCallback(callback, true);

            // Still not executed
            jest.advanceTimersByTime(600);
            expect(callback).toHaveBeenCalledTimes(1);

            // Executed
            jest.advanceTimersByTime(1500);
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it("should not schedule next execution while action is executing", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, 1000, true);
            executor.setCallback(callback, true);

            // First execution
            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(1);

            // Action starts executing
            executor.setCallback(callback, false);

            // Time passes but action is still executing
            jest.advanceTimersByTime(5000);
            expect(callback).toHaveBeenCalledTimes(1);

            // Action completes
            executor.setCallback(callback, true);

            // Not yet executed
            jest.advanceTimersByTime(900);
            expect(callback).toHaveBeenCalledTimes(1);

            // Now next execution should be scheduled
            jest.advanceTimersByTime(200);
            expect(callback).toHaveBeenCalledTimes(2);
        });
    });

    describe("State transitions and edge cases", () => {
        it("should handle canExecute changes during invoking state", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            // Timer fires, callback invoked (invoking state)
            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(1);

            // Simulate rapid canExecute changes during action start
            executor.setCallback(callback, true); // Still true
            executor.setCallback(callback, false); // Action starts (invoking -> executing)
            executor.setCallback(callback, false); // Still false
            executor.setCallback(callback, true); // Action completes (executing -> completed)

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("should handle canExecute changes during executing state", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, 2000, true);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(1);

            // Enter executing state
            executor.setCallback(callback, false);

            // Multiple updates while executing
            executor.setCallback(callback, false);
            executor.setCallback(callback, false);

            // Action completes
            executor.setCallback(callback, true);

            // Should schedule next
            jest.advanceTimersByTime(2100);
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it("should handle callback updates during lifecycle", () => {
            const executor = new TimerExecutor();
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback1, true);

            jest.advanceTimersByTime(510);

            // Update callback before timer fires
            executor.setCallback(callback2, true);

            jest.advanceTimersByTime(510);

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe("Stop functionality", () => {
        it("should cancel scheduled execution", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(500);
            executor.stop();

            jest.advanceTimersByTime(1000);
            expect(callback).not.toHaveBeenCalled();
        });

        it("should reset to idle state", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            executor.stop();

            expect(executor.isReady).toBe(false);
        });

        it("should allow restart after stop", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(500);
            executor.stop();

            // Restart
            executor.setParams(500, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(510);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe("React-like lifecycle simulation", () => {
        it("should handle mount, unmount, remount pattern", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            // Mount: initialize with params and callback
            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(500);

            // Unmount: cleanup
            executor.stop();

            jest.advanceTimersByTime(1000);
            expect(callback).not.toHaveBeenCalled();

            // Remount: reinitialize
            executor.setParams(500, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(510);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("should handle prop updates during lifecycle", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            // Initial mount
            executor.setParams(1000, 2000, true);
            executor.setCallback(callback, true);

            // First execution
            jest.advanceTimersByTime(1100);
            expect(callback).toHaveBeenCalledTimes(1);

            executor.setCallback(callback, false);
            executor.setCallback(callback, true);

            // Props update: change delay/interval
            executor.stop();
            executor.setParams(500, 1000, true);
            executor.setCallback(callback, true);

            // Next execution with new timing
            jest.advanceTimersByTime(510);
            expect(callback).toHaveBeenCalledTimes(2);

            executor.setCallback(callback, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(1000);
            expect(callback).toHaveBeenCalledTimes(3);
        });

        it("should handle rapid prop updates", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            // First set of params
            executor.setParams(1000, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(500);

            // Rapid prop updates (like React re-renders)
            executor.stop();
            executor.setParams(2000, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(1000);
            expect(callback).not.toHaveBeenCalled();

            // Final update with shorter delay
            executor.stop();
            executor.setParams(500, undefined, false);
            executor.setCallback(callback, true);

            // still not called
            jest.advanceTimersByTime(450);
            expect(callback).not.toHaveBeenCalled();

            // finally called
            jest.advanceTimersByTime(100);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("should handle cleanup during action execution", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, 2000, true);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(1000);
            expect(callback).toHaveBeenCalledTimes(1);

            // Action starts
            executor.setCallback(callback, false);

            // Component unmounts while action is executing
            executor.stop();

            // Action completes but component is unmounted
            // Should not schedule next execution
            jest.advanceTimersByTime(5000);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe("Edge cases and error scenarios", () => {
        it("should handle missing callback gracefully", () => {
            const executor = new TimerExecutor();

            executor.setParams(1000, undefined, false);

            // No callback set, should not throw
            expect(() => {
                jest.advanceTimersByTime(1100);
            }).not.toThrow();
        });

        it("should handle undefined params", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(undefined, undefined, false);
            executor.setCallback(callback, true);

            expect(executor.isReady).toBe(false);

            jest.advanceTimersByTime(5000);
            expect(callback).not.toHaveBeenCalled();
        });

        it("should handle zero delay", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(0, undefined, false);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(0);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it("should not execute if action never completes", () => {
            const executor = new TimerExecutor();
            const callback = jest.fn();

            executor.setParams(1000, 1000, true);
            executor.setCallback(callback, true);

            jest.advanceTimersByTime(1000);
            expect(callback).toHaveBeenCalledTimes(1);

            // Action starts but never completes
            executor.setCallback(callback, false);

            // Time passes indefinitely
            jest.advanceTimersByTime(100000);

            // Should still only have executed once
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
});
