import "@testing-library/jest-dom";
import { render, RenderResult } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { createElement } from "react";
import { ColorPicker, ColorPickerProps } from "../ColorPicker";

describe("ColorPicker", () => {
    let colorPickerProps: ColorPickerProps;
    let user: UserEvent;

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
        user = userEvent.setup();
    });

    function renderColorPicker(configs: Partial<ColorPickerProps> = {}): RenderResult {
        return render(<ColorPicker {...colorPickerProps} {...configs} />);
    }

    it("should handle on change event", async () => {
        const { getByTitle } = renderColorPicker({
            type: "block",
            mode: "inline",
            defaultColors: [{ color: "#F47373" }]
        });

        const colorElement = getByTitle("#F47373");
        await user.click(colorElement);

        expect(colorPickerProps.onColorChange).toHaveBeenCalled();
    });

    describe("renders a picker of type", () => {
        it("sketch", async () => {
            const { container, getByRole } = renderColorPicker({ type: "sketch" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".sketch-picker")).toBeInTheDocument();
        });

        it("chrome", async () => {
            const { container, getByRole } = renderColorPicker({ type: "chrome" });
            const colorElement = getByRole("button");

            await user.click(colorElement);
            expect(container.querySelector(".chrome-picker")).toBeInTheDocument();
        });

        it("block", async () => {
            const { container, getByRole } = renderColorPicker({ type: "block" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".block-picker")).toBeInTheDocument();
        });

        it("github", async () => {
            const { container, getByRole } = renderColorPicker({ type: "github" });
            const colorElement = getByRole("button");

            await user.click(colorElement);
            expect(container.querySelector(".github-picker")).toBeInTheDocument();
        });

        it("twitter", async () => {
            const { container, getByRole } = renderColorPicker({ type: "twitter" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".twitter-picker")).toBeInTheDocument();
        });

        it("circle", async () => {
            const { container, getByRole } = renderColorPicker({ type: "circle" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".circle-picker")).toBeInTheDocument();
        });

        it("hue", async () => {
            const { container, getByRole } = renderColorPicker({ type: "hue" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".hue-picker")).toBeInTheDocument();
        });

        it("slider", async () => {
            const { container, getByRole } = renderColorPicker({ type: "slider" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".slider-picker")).toBeInTheDocument();
        });

        it("compact", async () => {
            const { container, getByRole } = renderColorPicker({ type: "compact" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".compact-picker")).toBeInTheDocument();
        });

        it("material", async () => {
            const { container, getByRole } = renderColorPicker({ type: "material" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".material-picker")).toBeInTheDocument();
        });

        it("swatches", async () => {
            const { container, getByRole } = renderColorPicker({ type: "swatches" });
            const colorElement = getByRole("button");

            await user.click(colorElement);

            expect(container.querySelector(".swatches-picker")).toBeInTheDocument();
        });
    });
});
