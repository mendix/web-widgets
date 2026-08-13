import { PusherListener } from "../utils/PusherListener";

const mockChannel = {
    bind_global: jest.fn(),
    unbind_all: jest.fn(),
    bind: jest.fn()
};

const mockPusherInstance = {
    subscribe: jest.fn().mockReturnValue(mockChannel),
    unsubscribe: jest.fn(),
    disconnect: jest.fn(),
    connection: { bind: jest.fn(), unbind: jest.fn() }
};

jest.mock("pusher-js", () => jest.fn().mockImplementation(() => mockPusherInstance));

const stubConfig = { key: "key", cluster: "eu", authEndpoint: "/auth", csrfToken: "tok" };
const stubSubscription = {
    channelName: "private-Entity.123",
    eventBindings: [{ eventName: "update", onEvent: jest.fn() }]
};

describe("PusherListener", () => {
    let listener: PusherListener;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPusherInstance.subscribe.mockReturnValue(mockChannel);
        listener = new PusherListener(stubConfig);
    });

    it("subscribes to channel and binds global handler", () => {
        listener.subscribe(stubSubscription);

        expect(mockPusherInstance.subscribe).toHaveBeenCalledWith(stubSubscription.channelName);
        expect(mockChannel.bind_global).toHaveBeenCalledTimes(1);
    });

    it("skips Pusher resubscription on same channel name", () => {
        listener.subscribe(stubSubscription);
        listener.subscribe({ ...stubSubscription, eventBindings: [{ eventName: "other", onEvent: jest.fn() }] });

        expect(mockPusherInstance.subscribe).toHaveBeenCalledTimes(1);
    });

    it("resubscribes when channel name changes", () => {
        listener.subscribe(stubSubscription);
        listener.subscribe({ ...stubSubscription, channelName: "private-Entity.456" });

        expect(mockPusherInstance.unsubscribe).toHaveBeenCalledWith(stubSubscription.channelName);
        expect(mockPusherInstance.subscribe).toHaveBeenCalledWith("private-Entity.456");
    });

    it("updates handler map so new handler fires without resubscribing", () => {
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();

        listener.subscribe({ ...stubSubscription, eventBindings: [{ eventName: "update", onEvent: firstHandler }] });
        listener.subscribe({ ...stubSubscription, eventBindings: [{ eventName: "update", onEvent: secondHandler }] });

        const globalCb = mockChannel.bind_global.mock.calls[0][0] as (name: string, data: unknown) => void;
        globalCb("update", {});

        expect(mockPusherInstance.subscribe).toHaveBeenCalledTimes(1);
        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).toHaveBeenCalledTimes(1);
    });

    it("destroy disconnects and is idempotent", () => {
        listener.subscribe(stubSubscription);
        listener.destroy();
        listener.destroy();

        expect(mockPusherInstance.disconnect).toHaveBeenCalledTimes(1);
    });
});
