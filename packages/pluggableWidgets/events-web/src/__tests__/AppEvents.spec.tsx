import { actionValue } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { ValueStatus } from "mendix";
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
            componentLoadDelayInteger: 0,
            componentLoadDelayExpression: { value: undefined, status: ValueStatus.Unavailable },
            componentLoadRepeat: false,
            componentLoadRepeatParameterType: "number",
            componentLoadRepeatInterval: 0,
            componentLoadRepeatExpression: { value: undefined, status: ValueStatus.Unavailable },
            onEventChangeAttribute: undefined,
            onEventChange: undefined,
            onEventChangeDelayParameterType: "number",
            onEventChangeDelayInteger: 0,
            onEventChangeDelayExpression: { value: undefined, status: ValueStatus.Unavailable }
        };
    });
    it("render app events", async () => {
        const component = render(<Events {...defaultProps} />);
        const renderedDiv = await component.container.querySelector(".widget-events");

        expect(renderedDiv).toBeEmptyDOMElement();
    });
});
