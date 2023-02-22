import { shallow } from "enzyme";
import { createElement } from "react";
import { Sidebar } from "../components/Sidebar";
import { SidebarHeader } from "../components/SidebarHeader";
import { SidebarContent } from "../components/SidebarContent";

describe("Sidebar", () => {
    it("should render the structure correctly", () => {
        const sidebar = shallow(createElement(Sidebar, { open: false }));

        expect(sidebar).toBeElement(
            createElement(
                "div",
                { className: "widget-sidebar" },
                createElement("div", { className: "overlay", onClick: jasmine.any(Function) }),
                createElement("div", { className: "sidebar-content" })
            )
        );
    });

    describe("that is open", () => {
        it("should render with the widget-sidebar-open class", () => {
            const sidebar = shallow(createElement(Sidebar, { open: true }));

            expect(sidebar).toHaveClass("widget-sidebar-open");
        });

        it("should trigger the onBlur event handler when the overlay is clicked", () => {
            const onBlurSpy = jasmine.createSpy("onBlur");
            const sidebar = shallow(createElement(Sidebar, { open: true, onBlur: onBlurSpy }));
            const overlay = sidebar.find(".overlay");
            overlay.simulate("click");

            expect(onBlurSpy).toHaveBeenCalled();
        });
    });

    it("should render the sidebar header", () => {
        const sidebar = shallow(createElement(Sidebar, { open: true }, createElement(SidebarHeader)));
        const sidebarContent = sidebar.find(".sidebar-content");

        expect(sidebarContent.children().length).toBe(1);
        expect(sidebar.find(SidebarHeader).length).toBe(1);
    });

    it("should render the sidebar content", () => {
        const sidebar = shallow(createElement(Sidebar, { open: true }, createElement(SidebarContent)));
        const sidebarContent = sidebar.find(".sidebar-content");

        expect(sidebarContent.children().length).toBe(1);
        expect(sidebar.find(SidebarContent).length).toBe(1);
    });

    it("should render both the sidebar header and sidebar content", () => {
        const sidebar = shallow(
            createElement(Sidebar, { open: true }, createElement(SidebarHeader), createElement(SidebarContent))
        );
        const sidebarContent = sidebar.find(".sidebar-content");

        expect(sidebarContent.children().length).toBe(2);
        expect(sidebar.find(SidebarHeader).length).toBe(1);
        expect(sidebar.find(SidebarContent).length).toBe(1);
    });
});
