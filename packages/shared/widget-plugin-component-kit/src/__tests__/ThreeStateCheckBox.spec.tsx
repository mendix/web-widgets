import { createElement } from "react";
import { render, RenderResult } from "@testing-library/react";
import { ThreeStateCheckBox, ThreeStateCheckBoxEnum } from "../ThreeStateCheckBox";

describe("ThreeStateCheckBox", () => {
    const renderComponent = (value: ThreeStateCheckBoxEnum): RenderResult =>
        render(
            <ThreeStateCheckBox value={value} className="test-class" aria-label="Test Checkbox" onChange={jest.fn()} />
        );

    it("matches snapshot when value is 'all'", () => {
        const { asFragment, container } = renderComponent("all");
        expect(asFragment()).toMatchSnapshot();

        expect(container.querySelector("input")?.indeterminate).toBe(false);
    });

    it("matches snapshot when value is 'some'", () => {
        const { asFragment, container } = renderComponent("some");
        expect(asFragment()).toMatchSnapshot();

        expect(container.querySelector("input")?.indeterminate).toBe(true);
    });

    it("matches snapshot when value is 'none'", () => {
        const { asFragment, container } = renderComponent("none");
        expect(asFragment()).toMatchSnapshot();

        expect(container.querySelector("input")?.indeterminate).toBe(false);
    });
});
