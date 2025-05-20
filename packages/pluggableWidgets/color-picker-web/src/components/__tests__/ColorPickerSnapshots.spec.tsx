import "@testing-library/jest-dom";
import { act, render, RenderResult } from "@testing-library/react";
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

    it("renders the structure correctly", () => {
        const colorPickerComponent = renderColorPicker();

        expect(colorPickerComponent.asFragment()).toMatchSnapshot();
    });

    it("that is disabled renders with the structure", () => {
        const colorPickerComponent = renderColorPicker({ disabled: true });
        expect(colorPickerComponent.asFragment()).toMatchSnapshot();
    });

    it("renders picker with pre-defined default colors", () => {
        const colorPickerComponent = renderColorPicker();

        act(() => {
            colorPickerComponent.rerender(
                <ColorPicker
                    {...colorPickerProps}
                    mode="inline"
                    defaultColors={[{ color: "#2CCCE4" }, { color: "#555555" }]}
                />
            );
        });

        expect(colorPickerComponent.asFragment()).toMatchSnapshot();
    });

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
