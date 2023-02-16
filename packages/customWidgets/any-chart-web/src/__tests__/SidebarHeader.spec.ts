import { shallow } from "enzyme";
import { createElement } from "react";
import { SidebarHeader } from "../components/SidebarHeader";
import { IconButton } from "../components/IconButton";

describe("SidebarHeader", () => {
    it("should render the structure correctly", () => {
        const sidebarHeader = shallow(createElement(SidebarHeader, {}, "My Child"));

        expect(sidebarHeader).toBeElement(
            createElement(
                "div",
                { className: "sidebar-content-header" },
                createElement("div", { className: "header-content col-sm-12 col-xs-12" }, "My Child")
            )
        );
    });

    it("should render the close button when the close event handler is added", () => {
        const sidebarHeader = shallow(createElement(SidebarHeader, { onClose: jasmine.createSpy("onClick") }));

        expect(sidebarHeader).toBeElement(
            createElement(
                "div",
                { className: "sidebar-content-header" },
                createElement("div", { className: "header-content col-sm-10 col-xs-10" }),
                createElement(
                    "div",
                    { className: "col-sm-3 col-xs-3" },
                    createElement(IconButton, {
                        className: "pull-right remove",
                        glyphIcon: "remove",
                        onClick: jasmine.any(Function)
                    })
                )
            )
        );
    });

    it("close button should respond to click actions", () => {
        const onCloseSpy = jasmine.createSpy("onClick");
        const sidebarHeader = shallow(createElement(SidebarHeader, { onClose: onCloseSpy }));
        const closer = sidebarHeader.find(IconButton);
        closer.simulate("click");

        expect(onCloseSpy).toHaveBeenCalled();
    });
});
