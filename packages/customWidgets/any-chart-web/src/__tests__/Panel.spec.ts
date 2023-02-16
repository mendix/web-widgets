import { Panel, PanelProps } from "../components/Panel";
import { shallow } from "enzyme";
import { createElement } from "react";

describe("Panel", () => {
    const renderPanel = (props?: PanelProps) => shallow(createElement(Panel, props));

    it("without a heading should render the structure correctly", () => {
        const panel = shallow(createElement(Panel, {}, "Panel Content"));

        expect(panel).toBeElement(createElement("div", { className: "widget-panel" }, "Panel Content"));
    });

    describe("with a heading", () => {
        it("should render the structure correctly", () => {
            const panel = shallow(createElement(Panel, { heading: "My Heading" }, "Panel Content"));

            expect(panel).toBeElement(
                createElement(
                    "div",
                    { className: "widget-panel" },
                    createElement("div", { className: "widget-panel-header" }, "My Heading"),
                    "Panel Content"
                )
            );
        });

        it("should render with the configured headingClass", () => {
            const panel = renderPanel({ heading: "My Heading", headingClass: "awesome-panel" });

            expect(panel.find(".widget-panel-header")).toHaveClass("awesome-panel");
        });
    });

    it("should render the configured class name", () => {
        const panel = renderPanel({ className: "my-panel" });

        expect(panel).toHaveClass("my-panel");
    });
});
