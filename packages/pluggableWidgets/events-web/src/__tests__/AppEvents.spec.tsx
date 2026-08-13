import { actionValue, dynamic } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { EventsContainerProps } from "../../typings/EventsProps";
import Events from "../Events";

describe("App events (load)", () => {
    let defaultProps: EventsContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "app events",
            class: "app-events",
            onComponentLoad: actionValue(),
            componentLoadDelayParameterType: "number",
            componentLoadDelay: 0,
            componentLoadDelayExpression: dynamic.unavailable(),
            componentLoadRepeat: false,
            componentLoadRepeatIntervalParameterType: "number",
            componentLoadRepeatInterval: 0,
            componentLoadRepeatIntervalExpression: dynamic.unavailable(),
            onEventChangeAttribute: undefined,
            onEventChange: undefined,
            onEventChangeDelayParameterType: "number",
            onEventChangeDelay: 0,
            onEventChangeDelayExpression: dynamic.unavailable()
        };
    });
    it("render app events", async () => {
        const component = render(<Events {...defaultProps} />);
        const renderedDiv = await component.container.querySelector(".widget-events");

        expect(renderedDiv).toBeEmptyDOMElement();
    });
});
