import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { RefreshController } from "../controllers/RefreshController";

describe("RefreshController", () => {
    let host: ReactiveControllerHost;
    let queryHelper: { refresh: jest.Mock };
    let atom: { get: () => { refresh: jest.Mock } };
    let addControllerMock: jest.Mock;

    beforeEach(() => {
        addControllerMock = jest.fn();
        host = {
            addController: addControllerMock
        } as unknown as ReactiveControllerHost;
        queryHelper = {
            refresh: jest.fn()
        };
        atom = { get: () => queryHelper };
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should add itself to the host", () => {
        new RefreshController(host, { delay: 1000, query: atom });
        expect(addControllerMock).toHaveBeenCalledTimes(1);
    });

    it("should not set up a timer if delay is 0 or less", () => {
        const controller = new RefreshController(host, { delay: 0, query: atom });
        const dispose = controller.setup();
        expect(dispose).toBeUndefined();
    });

    it("should set up a timer if delay is greater than 0", () => {
        const controller = new RefreshController(host, { delay: 1000, query: atom });
        const dispose = controller.setup();
        expect(dispose).toBeInstanceOf(Function);

        jest.advanceTimersByTime(1000);
        expect(queryHelper.refresh).toHaveBeenCalledTimes(1);
    });

    it("should clear the timer when dispose is called", () => {
        const controller = new RefreshController(host, { delay: 1000, query: atom });
        const dispose = controller.setup();
        expect(dispose).toBeInstanceOf(Function);

        dispose!();
        jest.advanceTimersByTime(1000);
        expect(queryHelper.refresh).not.toHaveBeenCalled();
    });
});
