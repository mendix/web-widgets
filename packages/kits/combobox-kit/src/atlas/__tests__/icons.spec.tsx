import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { DownArrow } from "../icons";

describe("DownArrow", () => {
    it("is hidden from assistive technologies", () => {
        const { container } = render(<DownArrow />);

        const icon = container.querySelector("svg");
        expect(icon).toHaveAttribute("aria-hidden", "true");
    });
});
