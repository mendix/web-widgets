import { actionValue } from "@mendix/widget-plugin-test-utils";
import { render } from "@testing-library/react";
import { ActionValue, DynamicValue, ObjectItem } from "mendix";
import { createElement } from "react";
import * as usePusherSubscribeModule from "../hooks/usePusherSubscribe";
import Pusher from "../Pusher";
import * as getChannelNameModule from "../utils/getChannelName";

jest.mock("../utils/getChannelName");
jest.mock("../hooks/usePusherSubscribe", () => ({
    usePusherSubscribe: jest.fn()
}));

const mockGetChannelName = getChannelNameModule.getChannelName as jest.MockedFunction<
    typeof getChannelNameModule.getChannelName
>;
const mockUsePusherSubscribe = usePusherSubscribeModule.usePusherSubscribe as jest.Mock;

function makeProps(channelName: string | undefined, handlers: Array<{ actionName: string; action: ActionValue }>) {
    mockGetChannelName.mockReturnValue(channelName);
    return {
        name: "pusher",
        class: "",
        objectSource: {} as DynamicValue<ObjectItem>,
        eventHandlers: handlers
    } as any;
}

describe("Pusher", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("passes undefined subscription when channelName is undefined", () => {
        render(createElement(Pusher, makeProps(undefined, [{ actionName: "update", action: actionValue() }])));

        expect(mockUsePusherSubscribe).toHaveBeenCalledWith(undefined);
    });

    it("passes undefined subscription when eventHandlers is empty", () => {
        render(createElement(Pusher, makeProps("private-Entity.123", [])));

        expect(mockUsePusherSubscribe).toHaveBeenCalledWith(undefined);
    });

    it("passes subscription with correct channelName and eventBindings", () => {
        const action = actionValue();
        render(createElement(Pusher, makeProps("private-Entity.123", [{ actionName: "update", action }])));

        expect(mockUsePusherSubscribe).toHaveBeenCalledWith(
            expect.objectContaining({
                channelName: "private-Entity.123",
                eventBindings: [expect.objectContaining({ eventName: "update" })]
            })
        );
    });

    it("calls executeAction when onEvent fires", () => {
        const action = actionValue();
        render(createElement(Pusher, makeProps("private-Entity.123", [{ actionName: "update", action }])));

        const { eventBindings } = mockUsePusherSubscribe.mock.calls[0][0];
        eventBindings[0].onEvent();

        expect(action.execute).toHaveBeenCalledTimes(1);
    });
});
