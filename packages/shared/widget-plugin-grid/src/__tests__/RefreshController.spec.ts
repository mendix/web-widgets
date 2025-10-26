import { ReactiveControllerHost } from "@mendix/widget-plugin-mobx-kit/main";
import { RefreshController } from "../query/RefreshController";

describe("RefreshController", () => {
    let host: ReactiveControllerHost;
    let query: { backgroundRefresh: jest.Mock; datasource: unknown };
    let addControllerMock: jest.Mock;

    beforeEach(() => {
        addControllerMock = jest.fn();
        host = {
            addController: addControllerMock
        } as unknown as ReactiveControllerHost;
        query = {
            backgroundRefresh: jest.fn(),
            datasource: {}
        };
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should add itself to the host", () => {
        new RefreshController(host, query, 1000);
        expect(addControllerMock).toHaveBeenCalledTimes(1);
    });

    it("should not set up a timer if delay is 0 or less", () => {
        const controller = new RefreshController(host, query, 0);
        const dispose = controller.setup();
        expect(dispose).toBeUndefined();
    });

    it("should set up a timer if delay is greater than 0", () => {
        const controller = new RefreshController(host, query, 1);
        const dispose = controller.setup();
        expect(dispose).toBeInstanceOf(Function);

        jest.advanceTimersByTime(1000);
        expect(query.backgroundRefresh).toHaveBeenCalledTimes(1);
    });

    it("should clear the timer when dispose is called", () => {
        const controller = new RefreshController(host, query, 1);
        const dispose = controller.setup();
        expect(dispose).toBeInstanceOf(Function);

        dispose!();
        jest.advanceTimersByTime(1000);
        expect(query.backgroundRefresh).not.toHaveBeenCalled();
    });
});
