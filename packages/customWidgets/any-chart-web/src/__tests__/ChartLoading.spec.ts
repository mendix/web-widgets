import { shallow } from "enzyme";
import { createElement } from "react";
import { ChartLoading, generateDivs } from "../components/ChartLoading";

describe("ChartLoading", () => {
    it("should render the structure correctly", () => {
        const loading = shallow(createElement(ChartLoading));

        expect(loading).toBeElement(
            createElement(
                "div",
                { className: "widget-charts-loading-wrapper" },
                createElement("div", { className: "widget-charts-loading-indicator" }, ...generateDivs(12))
            )
        );
    });
});
