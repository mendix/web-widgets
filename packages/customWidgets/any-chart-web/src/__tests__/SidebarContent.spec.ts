import { shallow } from "enzyme";
import { createElement } from "react";
import { SidebarContent } from "../components/SidebarContent";
import createSpy = jasmine.createSpy;

describe("SidebarContent", () => {
    it("should render the structure correctly", () => {
        const sidebarContent = shallow(createElement(SidebarContent));

        expect(sidebarContent).toBeElement(createElement("div", { className: "sidebar-content-body" }));
    });

    it("should respond to click actions", () => {
        const onClickSpy = createSpy("onClick");
        const sidebarContent = shallow(createElement(SidebarContent, { onClick: onClickSpy }));
        sidebarContent.simulate("click");

        expect(onClickSpy).toHaveBeenCalled();
    });

    it("should render the specified content", () => {
        const sidebarContent = shallow(createElement(SidebarContent, {}, "My Content!"));

        expect(sidebarContent).toBeElement(createElement("div", { className: "sidebar-content-body" }, "My Content!"));
    });
});
