import { render, screen, fireEvent } from "@testing-library/react";
import { type ComponentProps } from "react";
import { CropToolbar } from "../CropToolbar";

function props(overrides = {}): ComponentProps<typeof CropToolbar> {
    return {
        showRotation: true,
        showGrayscale: true,
        showZoom: true,
        showReset: true,
        grayscale: false,
        canReset: true,
        zoom: 1,
        minZoom: 1,
        maxZoom: 4,
        onRotateLeft: jest.fn(),
        onRotateRight: jest.fn(),
        onToggleGrayscale: jest.fn(),
        onZoomChange: jest.fn(),
        onReset: jest.fn(),
        ...overrides
    };
}

describe("<CropToolbar>", () => {
    test("fires rotate and reset callbacks", () => {
        const p = props();
        render(<CropToolbar {...p} />);
        fireEvent.click(screen.getByLabelText("Rotate left"));
        fireEvent.click(screen.getByLabelText("Rotate right"));
        fireEvent.click(screen.getByRole("button", { name: "Reset crop" }));
        expect(p.onRotateLeft).toHaveBeenCalledTimes(1);
        expect(p.onRotateRight).toHaveBeenCalledTimes(1);
        expect(p.onReset).toHaveBeenCalledTimes(1);
    });

    test("grayscale toggle reflects aria-pressed", () => {
        render(<CropToolbar {...props({ grayscale: true })} />);
        expect(screen.getByLabelText("Grayscale")).toHaveAttribute("aria-pressed", "true");
    });

    test("hides controls when their flags are false", () => {
        render(<CropToolbar {...props({ showRotation: false, showGrayscale: false, showReset: false })} />);
        expect(screen.queryByLabelText("Rotate left")).toBeNull();
        expect(screen.queryByLabelText("Grayscale")).toBeNull();
        expect(screen.queryByRole("button", { name: "Reset crop" })).toBeNull();
    });

    test("reset button disabled when canReset is false", () => {
        render(<CropToolbar {...props({ canReset: false })} />);
        expect(screen.getByRole("button", { name: "Reset crop" })).toBeDisabled();
    });

    test("hides zoom slider when showZoom is false", () => {
        render(<CropToolbar {...props({ showZoom: false })} />);
        expect(screen.queryByLabelText("Zoom")).toBeNull();
    });

    test("every toolbar button exposes a native title tooltip", () => {
        render(<CropToolbar {...props()} />);
        expect(screen.getByRole("button", { name: "Rotate left" })).toHaveAttribute("title", "Rotate left");
        expect(screen.getByRole("button", { name: "Rotate right" })).toHaveAttribute("title", "Rotate right");
        expect(screen.getByRole("button", { name: "Grayscale" })).toHaveAttribute("title", "Grayscale");
        expect(screen.getByRole("button", { name: "Reset crop" })).toHaveAttribute("title", "Reset");
    });
});
