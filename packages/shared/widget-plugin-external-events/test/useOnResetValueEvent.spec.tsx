import { createElement } from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { useOnResetValueEvent } from "../src/hooks/useOnResetValueEvent";
import { requirePlugin, deletePlugin } from "../src/plugin";

function Filter(props: { widgetName: string; parentChannelName: string; listener: jest.Mock }): null {
    useOnResetValueEvent({
        widgetName: props.widgetName,
        parentChannelName: props.parentChannelName,
        listener: props.listener
    });
    return null;
}

describe("useOnResetValueEvent", () => {
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
