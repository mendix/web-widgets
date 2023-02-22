import { mount, shallow } from "enzyme";
import { createElement } from "react";

import { InfoTooltip, InfoTooltipProps } from "../components/InfoTooltip";

describe("InfoTooltip", () => {
    const renderTooltipInfo = (props: InfoTooltipProps) => shallow(createElement(InfoTooltip, props));
    const renderFullTooltipInfo = (props: InfoTooltipProps) => mount(createElement(InfoTooltip, props));

    it("should not show the tooltip by default", () => {
        const tooltip = renderFullTooltipInfo({ onClick: jasmine.createSpy("onClick") });

        expect(tooltip.props().show).toBe(false);
    });

    describe("that is not configured to show the tooltip", () => {
        it("should render the structure correctly", () => {
            const tooltip = renderTooltipInfo({ onClick: jasmine.createSpy("onClick") });

            expect(tooltip).toBeElement(
                createElement(
                    "div",
                    {
                        className: "widget-info-tooltip glyphicon glyphicon-info-sign",
                        onClick: jasmine.any(Function)
                    },
                    null
                )
            );
        });
    });

    describe("that is configured to show the tooltip", () => {
        it("should render the structure correctly", () => {
            const tooltip = renderTooltipInfo({ onClick: jasmine.createSpy("onClick"), show: true });

            expect(tooltip).toBeElement(
                createElement(
                    "div",
                    {
                        className: "widget-info-tooltip glyphicon glyphicon-info-sign",
                        onClick: jasmine.any(Function)
                    },
                    createElement("div", {
                        className: "widget-info-tooltip-info",
                        onClick: jasmine.any(Function)
                    })
                )
            );
        });

        it("should set the width of the tooltip", () => {
            const tooltip = renderTooltipInfo({ onClick: jasmine.createSpy("onClick"), show: true });
            tooltip.setState({ width: 150 });
            const tooltipInfo = tooltip.find(".widget-info-tooltip-info");

            expect(tooltipInfo.props().style).toEqual({ width: "150px" });
        });
    });

    it("should respond to click actions", () => {
        const onClickSpy = jasmine.createSpy("onClick");
        const onInfoClickSpy = spyOn(InfoTooltip.prototype, "onInfoClick" as any);
        const tooltip = renderTooltipInfo({ onClick: onClickSpy, show: true });
        tooltip.simulate("click");

        expect(onClickSpy).toHaveBeenCalled();

        const tooltipInfo = tooltip.find(".widget-info-tooltip-info");
        tooltipInfo.simulate("click");

        expect(onInfoClickSpy).toHaveBeenCalled();
    });
});
