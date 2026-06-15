import { render, screen, fireEvent } from "@testing-library/react";
import { type ComponentProps } from "react";
import { CropToolbar } from "../CropToolbar";

function props(overrides = {}): ComponentProps<typeof CropToolbar> {
    return {
        showRotation: true,
        showGrayscale: true,
        showReset: true,
        grayscale: false,
        canReset: true,
        onRotateLeft: jest.fn(),
        onRotateRight: jest.fn(),
        onToggleGrayscale: jest.fn(),
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
        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        expect(p.onRotateLeft).toHaveBeenCalledTimes(1);
        expect(p.onRotateRight).toHaveBeenCalledTimes(1);
        expect(p.onReset).toHaveBeenCalledTimes(1);
    });

    test("grayscale toggle reflects aria-pressed", () => {
        render(<CropToolbar {...props({ grayscale: true })} />);
        expect(screen.getByLabelText("Black and white")).toHaveAttribute("aria-pressed", "true");
    });

    test("hides controls when their flags are false", () => {
        render(<CropToolbar {...props({ showRotation: false, showGrayscale: false, showReset: false })} />);
        expect(screen.queryByLabelText("Rotate left")).toBeNull();
        expect(screen.queryByLabelText("Black and white")).toBeNull();
        expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
    });

    test("reset button disabled when canReset is false", () => {
        render(<CropToolbar {...props({ canReset: false })} />);
        expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    });
});
