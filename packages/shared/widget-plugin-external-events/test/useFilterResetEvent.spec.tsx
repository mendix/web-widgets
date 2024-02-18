import { createElement } from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { useFilterResetEvent } from "../src/hooks";
import { requirePlugin } from "../src/plugin";
import { deletePlugin } from "./utils";

function Filter(props: { widgetName: string; parentChannelName: string; listener: jest.Mock }): null {
    useFilterResetEvent({
        widgetName: props.widgetName,
        parentChannelName: props.parentChannelName,
        listener: props.listener
    });
    return null;
}

describe("useFilterResetEvent", () => {
    beforeEach(() => deletePlugin());

    it("calls listener when event is fired", () => {
        const listener = jest.fn();
        const plugin = requirePlugin();

        render(<Filter widgetName="widget" parentChannelName="parentWidget" listener={listener} />);

        plugin.emit("widget", "reset.value");
        expect(listener).toHaveBeenCalledTimes(1);

        plugin.emit("parentWidget", "reset.value");
        expect(listener).toHaveBeenCalledTimes(2);

        plugin.emit("parentWidget", "reset.value");
        expect(listener).toHaveBeenCalledTimes(3);
    });
});
