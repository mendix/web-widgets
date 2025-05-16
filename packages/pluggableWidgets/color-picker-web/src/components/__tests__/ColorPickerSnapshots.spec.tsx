import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import { createElement } from "react";
import { ColorPicker, ColorPickerProps } from "../ColorPicker";

jest.mock("react-color/lib", () => ({
    SketchPicker: "sketch-picker"
}));

describe("ColorPicker", () => {
    let colorPickerProps: ColorPickerProps;

    beforeEach(() => {
        colorPickerProps = {
            color: "#000000",
            disabled: false,
            defaultColors: [],
            format: "hex",
            mode: "popover",
            type: "sketch",
            onChange: jest.fn(),
            onColorChange: jest.fn(),
            id: "color-picker",
            name: "color picker"
        };
    });

    function renderColorPicker(configs: Partial<ColorPickerProps> = {}): RenderResult {
        return render(<ColorPicker {...colorPickerProps} {...configs} />);
    }

    describe("with a mode as", () => {
        it("popover or input renders with the structure", () => {
            const colorPickerComponent = renderColorPicker({ mode: "popover" });

            expect(colorPickerComponent.asFragment()).toMatchSnapshot();
        });

        it("inline renders with the structure", () => {
            const colorPickerComponent = renderColorPicker({ mode: "inline" });

            expect(colorPickerComponent.asFragment()).toMatchSnapshot();
        });
    });
});
