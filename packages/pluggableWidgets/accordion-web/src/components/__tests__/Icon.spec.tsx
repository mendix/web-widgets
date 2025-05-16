import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { createElement } from "react";
import { Icon, IconProps } from "../Icon";

describe("Icon", () => {
    let defaultIconProps: IconProps;

    beforeEach(() => {
        defaultIconProps = {
            data: { type: "glyph", iconClass: "icon-class" },
            loading: false,
            animate: true
        };
    });

    function renderIcon(props: Partial<IconProps> = {}): RenderResult {
        return render(<Icon {...defaultIconProps} {...props} />);
    }

    describe("Rendering", () => {
        it("renders glyph icons", () => {
            const icon = renderIcon();

            expect(icon.asFragment()).toMatchSnapshot();
        });

        it("renders image icons", () => {
            const icon = renderIcon({ data: { type: "image", iconUrl: "icon.url" } });

            expect(icon.asFragment()).toMatchSnapshot();
        });

        it("renders a default icon", () => {
            const icon = renderIcon({ data: undefined });

            expect(icon.asFragment()).toMatchSnapshot();
        });

        it("doesn't render a default icon while loading", () => {
            const icon = renderIcon({ data: undefined, loading: true });

            expect(icon.asFragment()).toMatchSnapshot();
        });

        it("doesn't render an icon with an unknown icon data type", () => {
            const icon = renderIcon({ data: { type: "unknown" } as any });

            expect(icon.asFragment()).toMatchSnapshot();
        });
    });

    describe("Animation Behaviour", () => {
        it("doesn't apply an animate class to a glyph icon when animate is false", () => {
            const icon = renderIcon({ animate: false });
            const spanElement = icon.container.querySelector("span");

            expect(spanElement).not.toHaveClass("widget-accordion-group-header-icon-animate");
        });

        it("doesn't apply an animate class to an image icon when animate is false", () => {
            const icon = renderIcon({
                data: { type: "image", iconUrl: "icon.url" },
                animate: false
            });
            const imgElement = icon.container.querySelector("img");

            expect(imgElement).not.toHaveClass("widget-accordion-group-header-icon-animate");
        });

        it("doesn't apply an animate class to a default icon when animate is false", () => {
            const icon = renderIcon({ data: undefined, animate: false });
            const svgElement = icon.container.querySelector("svg");
            expect(svgElement).not.toHaveClass("widget-accordion-group-header-icon-animate");
        });
    });
});
