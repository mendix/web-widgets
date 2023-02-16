import { shallow } from "enzyme";
import { createElement } from "react";

import { HoverTooltip } from "../components/HoverTooltip";

describe("HoverTooltip", () => {
    const renderHoverTooltip = (props: { text?: string | number }) => shallow(createElement(HoverTooltip, props));

    it("renders structure correctly", () => {
        const tooltip = renderHoverTooltip({ text: 3 });

        expect(tooltip).toBeElement(createElement("div", {}, 3));
    });

    it("renders no structure when no text is specified", () => {
        const tooltip = renderHoverTooltip({});

        expect(tooltip).toBeElement(null);
    });
});
