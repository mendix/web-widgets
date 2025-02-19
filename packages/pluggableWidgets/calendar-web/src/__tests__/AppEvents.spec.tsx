import { actionValue } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
// import { mount } from "enzyme";
import { createElement } from "react";
import { EventsContainerProps } from "../../typings/EventsProps";
import Events from "../Events";

describe("App events (load)", () => {
    let defaultProps: EventsContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "app events",
            class: "app-events",
            onComponentLoad: actionValue(),
            componentLoadDelay: 0,
            onEventChangeDelay: 0,
            componentLoadRepeat: false,
            componentLoadRepeatInterval: 0
        };
    });
    it("render app events", async () => {
        const component = render(<Events {...defaultProps} />);
        const renderedDiv = await component.container.querySelector(".widget-events");

        expect(renderedDiv).toBeEmptyDOMElement();
    });
});
