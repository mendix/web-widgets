import { actionValue, obj } from "@mendix/widget-plugin-test-utils";
import { ObjectCreationHelper } from "../ObjectCreationHelper";

describe("ObjectCreationHelper", () => {
    test("fires only one request at a time", async () => {
        jest.useFakeTimers();
        const createAction = actionValue(true, false);
        const helper = new ObjectCreationHelper("grid1", 10);
        helper.updateProps(createAction);
        helper.enable();
        const req1 = helper.request();
        const req2 = helper.request();
        jest.advanceTimersByTime(1000);

        // ensure the action is called once
        expect(createAction.execute).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(1000);

        // finish first request
        helper.processEmptyObjectItem(obj("a"));
        await expect(req1).resolves.toEqual(obj("a"));
        jest.advanceTimersByTime(1000);

        // ensure the action is called second time
        expect(createAction.execute).toHaveBeenCalledTimes(2);
        jest.advanceTimersByTime(1000);

        // finish second request
        helper.processEmptyObjectItem(obj("b"));
        await expect(req2).resolves.toEqual(obj("b"));
    });

    test("fails all requests if timeout is reached", async () => {
        jest.useFakeTimers();
        const helper = new ObjectCreationHelper("grid1", 10);
        const createAction = actionValue(true, false);
        helper.updateProps(createAction);
        helper.enable();
        const req1 = helper.request();
        const req2 = helper.request();
        jest.advanceTimersByTime(11000);

        await expect(req1).rejects.toBeInstanceOf(Error);
        await expect(req2).rejects.toBeInstanceOf(Error);
    });

    test("executes requests when enabled", async () => {
        jest.useFakeTimers();
        const helper = new ObjectCreationHelper("grid1", 10);
        const createAction = actionValue(true, false);
        helper.updateProps(createAction);
        const req1 = helper.request();
        const req2 = helper.request();
        jest.advanceTimersByTime(1000);

        // check that action is not yet called
        expect(createAction.execute).toHaveBeenCalledTimes(0);

        helper.enable();
        expect(createAction.execute).toHaveBeenCalledTimes(1);

        helper.processEmptyObjectItem(obj("a"));
        await expect(req1).resolves.toEqual(obj("a"));

        expect(createAction.execute).toHaveBeenCalledTimes(2);
        helper.processEmptyObjectItem(obj("b"));
        await expect(req2).resolves.toEqual(obj("b"));
    });
});
