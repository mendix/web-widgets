import { actionValue } from "@mendix/widget-plugin-test-utils";
import { flushPromises } from "../../__tests__/testProps";
import { ActionRunner } from "../ActionRunner";

describe("ActionRunner", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("executes the action and resolves after it was executing and stopped", async () => {
        const runner = new ActionRunner(10);
        const action = actionValue(true, false);
        const done = jest.fn();

        runner.run(action).then(done);
        expect(action.execute).toHaveBeenCalledTimes(1);
        expect(runner.isRunning).toBe(true);

        runner.update(actionValue(true, true));
        await flushPromises();
        expect(done).not.toHaveBeenCalled();

        runner.update(actionValue(true, false));
        await flushPromises();
        expect(done).toHaveBeenCalledTimes(1);
        expect(runner.isRunning).toBe(false);
    });

    test("does not resolve before the action was seen executing", async () => {
        const runner = new ActionRunner(10);
        const done = jest.fn();

        runner.run(actionValue(true, false)).then(done);
        runner.update(actionValue(true, false));
        await flushPromises();

        expect(done).not.toHaveBeenCalled();
    });

    test("rejects after the timeout", async () => {
        const runner = new ActionRunner(10);
        const result = runner.run(actionValue(true, false));

        jest.advanceTimersByTime(10001);

        await expect(result).rejects.toBeInstanceOf(Error);
        expect(runner.isRunning).toBe(false);
    });

    test("rejects when the action can't execute", async () => {
        const runner = new ActionRunner(10);
        const action = actionValue(false, false);

        await expect(runner.run(action)).rejects.toBeInstanceOf(Error);
        expect(action.execute).not.toHaveBeenCalled();
    });

    test("rejects when there is no action", async () => {
        await expect(new ActionRunner(10).run(undefined)).rejects.toBeInstanceOf(Error);
    });

    test("rejects a second run while the first is running", async () => {
        const runner = new ActionRunner(10);
        runner.run(actionValue(true, false));

        await expect(runner.run(actionValue(true, false))).rejects.toBeInstanceOf(Error);
    });
});
