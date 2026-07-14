import { act, renderHook } from "@testing-library/react";
import { usePusherSubscribe } from "../hooks/usePusherSubscribe";
import { createPusherListener } from "../utils/createPusherListener";

jest.mock("../utils/createPusherListener");

const mockListener = {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    destroy: jest.fn()
};

const mockCreatePusherListener = createPusherListener as jest.MockedFunction<typeof createPusherListener>;

const stubSubscription = {
    channelName: "private-Entity.123",
    eventBindings: [{ eventName: "update", onEvent: jest.fn() }]
};

describe("usePusherSubscribe", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreatePusherListener.mockResolvedValue(mockListener as never);
    });

    it("calls subscribe when listener and subscription are ready", async () => {
        renderHook(() => usePusherSubscribe(stubSubscription));

        await act(async () => {});

        expect(mockListener.subscribe).toHaveBeenCalledWith(stubSubscription);
    });

    it("calls unsubscribe when subscription is undefined", async () => {
        renderHook(() => usePusherSubscribe(undefined));

        await act(async () => {});

        expect(mockListener.unsubscribe).toHaveBeenCalledTimes(1);
        expect(mockListener.subscribe).not.toHaveBeenCalled();
    });

    it("calls destroy on unmount, not unsubscribe directly", async () => {
        const { unmount } = renderHook(() => usePusherSubscribe(stubSubscription));

        await act(async () => {});

        const unsubscribeCallsBefore = mockListener.unsubscribe.mock.calls.length;

        act(() => {
            unmount();
        });

        expect(mockListener.destroy).toHaveBeenCalledTimes(1);
        expect(mockListener.unsubscribe.mock.calls.length).toBe(unsubscribeCallsBefore);
    });
});
