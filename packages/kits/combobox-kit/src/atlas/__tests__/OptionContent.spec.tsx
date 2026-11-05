import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ComboboxOptionVM } from "../../core/ComboboxViewModel";
import { OptionContent } from "../OptionContent";

const option: ComboboxOptionVM = {
    id: "a",
    caption: "Apple",
    content: <b>custom Apple</b>,
    selected: false,
    highlighted: false
};

describe("OptionContent", () => {
    it.each([
        ["none", "menu", "Apple"],
        ["none", "input", "Apple"],
        ["menuOnly", "menu", "custom Apple"],
        ["menuOnly", "input", "Apple"],
        ["everywhere", "menu", "custom Apple"],
        ["everywhere", "input", "custom Apple"]
    ] as const)("with custom content '%s' renders the %s placement as '%s'", (customContent, placement, text) => {
        const { container } = render(
            <OptionContent option={option} placement={placement} customContent={customContent} />
        );

        expect(container.textContent).toBe(text);
        const custom = text.startsWith("custom");
        expect(container.querySelector(".widget-combobox-caption-custom") !== null).toBe(custom);
        expect(container.querySelector(".widget-combobox-caption-text") !== null).toBe(!custom);
    });

    it("renders the caption when the option has no content, whatever the hint", () => {
        const { container } = render(
            <OptionContent option={{ ...option, content: undefined }} placement="menu" customContent="everywhere" />
        );

        expect(container.querySelector(".widget-combobox-caption-text")?.textContent).toBe("Apple");
    });

    it("labels the checkbox of a menu option", () => {
        const { container } = render(
            <OptionContent option={option} placement="menu" customContent="none" htmlFor="cb_a" />
        );

        expect(container.querySelector("label.widget-combobox-caption-text")).toHaveAttribute("for", "cb_a");
    });
});
