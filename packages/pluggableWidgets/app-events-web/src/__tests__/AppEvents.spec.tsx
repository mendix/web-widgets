import { actionValue } from "@mendix/widget-plugin-test-utils";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
// import { mount } from "enzyme";
import { createElement } from "react";
import { AppEventsContainerProps } from "../../typings/AppEventsProps";
import Appevents from "../AppEvents";

describe("App events (load)", () => {
    let defaultProps: AppEventsContainerProps;
    beforeEach(() => {
        defaultProps = {
            name: "app events",
            class: "app-events",
            onComponentLoad: actionValue(),
            componentLoadDelay: 0,
            onAttributeEventChangeDelay: 0,
            componentLoadRepeat: false,
            componentLoadRepeatInterval: 0
        };
    });
    it("render app events", async () => {
        const component = render(<Appevents {...defaultProps} />);
        const renderedDiv = await component.container.querySelector(".widget-appevents");

        expect(renderedDiv).toBeEmptyDOMElement();
    });
});
