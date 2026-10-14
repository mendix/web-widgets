import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DialogShell } from "../DialogShell";

const OVERLAY_SELECTOR = ".widget-rich-text-dialog-overlay";

function renderShell(mode: "inline" | "focused", onClose = jest.fn()): { onClose: jest.Mock } {
    const reference = document.createElement("button");
    document.body.appendChild(reference);

    render(
        <DialogShell mode={mode} onClose={onClose} referenceElement={reference} ariaLabelledBy="shell-title">
            <h3 id="shell-title">Shell title</h3>
            <div className="dialog-actions">
                <button type="button">Close</button>
            </div>
        </DialogShell>
    );

    return { onClose };
}

describe("DialogShell inline mode", () => {
    it("renders no overlay and does not lock body scroll", () => {
        renderShell("inline");

        expect(document.querySelector(OVERLAY_SELECTOR)).toBeNull();
        expect(document.body.style.overflow).not.toBe("hidden");
    });

    it("closes on outside mousedown", () => {
        const { onClose } = renderShell("inline");

        fireEvent.mouseDown(document.body);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not close on mousedown inside the dialog", () => {
        const { onClose } = renderShell("inline");

        fireEvent.mouseDown(screen.getByRole("button", { name: "Close" }));

        expect(onClose).not.toHaveBeenCalled();
    });
});

describe("DialogShell focused mode", () => {
    it("renders the overlay, locks body scroll and exposes modal dialog semantics", () => {
        renderShell("focused");

        expect(document.querySelector(OVERLAY_SELECTOR)).not.toBeNull();
        expect(document.body).toHaveStyle({ overflow: "hidden" });

        const dialog = screen.getByRole("dialog", { name: "Shell title" });
        expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("moves focus into the dialog", async () => {
        renderShell("focused");

        const dialog = screen.getByRole("dialog", { name: "Shell title" });
        await waitFor(() => expect(dialog).toHaveFocus());
    });

    it("closes on Escape", () => {
        const { onClose } = renderShell("focused");

        fireEvent.keyDown(screen.getByRole("dialog", { name: "Shell title" }), { key: "Escape" });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on overlay mousedown", () => {
        const { onClose } = renderShell("focused");

        fireEvent.mouseDown(document.querySelector(OVERLAY_SELECTOR) as HTMLElement);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    // Regression guard: without capture-phase handling plus stopPropagation, one Escape both closes
    // the dialog and exits the editor's fullscreen mode.
    it("stops Escape before it reaches other listeners", () => {
        const spy = jest.fn();
        document.body.addEventListener("keydown", spy, true);

        try {
            const { onClose } = renderShell("focused");
            fireEvent.keyDown(screen.getByRole("dialog", { name: "Shell title" }), { key: "Escape" });

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(spy).not.toHaveBeenCalled();
        } finally {
            document.body.removeEventListener("keydown", spy, true);
        }
    });
});

describe("DialogShell portalling", () => {
    // The widget node clips overflow, and a transformed ancestor makes it the containing block for
    // `position: fixed`, so a dialog rendered in place can be clipped in both modes.
    it.each(["inline", "focused"] as const)("renders %s outside the widget's own subtree", mode => {
        const onClose = jest.fn();
        const { container } = render(
            <DialogShell mode={mode} onClose={onClose} ariaLabelledBy="shell-title">
                <h3 id="shell-title">Shell title</h3>
            </DialogShell>
        );

        const dialog = document.querySelector(".toolbar-dialog");
        expect(dialog).not.toBeNull();
        expect(container.contains(dialog)).toBe(false);
    });
});
