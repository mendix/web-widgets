import { render, screen, fireEvent } from "@testing-library/react";
import { type ComponentProps } from "react";
import { CropToolbar } from "../CropToolbar";

function props(overrides = {}): ComponentProps<typeof CropToolbar> {
    return {
        showFlip: true,
        showGrayscale: true,
        showZoom: true,
        showReset: true,
        grayscale: false,
        canReset: true,
        zoom: 1,
        minZoom: 1,
        maxZoom: 4,
        onFlipLeft: jest.fn(),
        onFlipRight: jest.fn(),
        onToggleGrayscale: jest.fn(),
        onZoomChange: jest.fn(),
        onReset: jest.fn(),
        ...overrides
    };
}

describe("<CropToolbar>", () => {
    test("fires flip and reset callbacks", () => {
        const p = props();
        render(<CropToolbar {...p} />);
        fireEvent.click(screen.getByLabelText("Flip left"));
        fireEvent.click(screen.getByLabelText("Flip right"));
        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        expect(p.onFlipLeft).toHaveBeenCalledTimes(1);
        expect(p.onFlipRight).toHaveBeenCalledTimes(1);
        expect(p.onReset).toHaveBeenCalledTimes(1);
    });

    test("grayscale toggle reflects aria-pressed", () => {
        render(<CropToolbar {...props({ grayscale: true })} />);
        expect(screen.getByLabelText("Grayscale")).toHaveAttribute("aria-pressed", "true");
    });

    test("hides controls when their flags are false", () => {
        render(<CropToolbar {...props({ showFlip: false, showGrayscale: false, showReset: false })} />);
        expect(screen.queryByLabelText("Flip left")).toBeNull();
        expect(screen.queryByLabelText("Grayscale")).toBeNull();
        expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
    });

    test("reset button disabled when canReset is false", () => {
        render(<CropToolbar {...props({ canReset: false })} />);
        expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    });

    test("hides zoom slider when showZoom is false", () => {
        render(<CropToolbar {...props({ showZoom: false })} />);
        expect(screen.queryByLabelText("Zoom")).toBeNull();
    });

    test("every toolbar button exposes a native title tooltip", () => {
        render(<CropToolbar {...props()} />);
        expect(screen.getByRole("button", { name: "Flip left" })).toHaveAttribute("title", "Flip left");
        expect(screen.getByRole("button", { name: "Flip right" })).toHaveAttribute("title", "Flip right");
        expect(screen.getByRole("button", { name: "Grayscale" })).toHaveAttribute("title", "Grayscale");
        expect(screen.getByRole("button", { name: "Reset" })).toHaveAttribute("title", "Reset");
    });
});
