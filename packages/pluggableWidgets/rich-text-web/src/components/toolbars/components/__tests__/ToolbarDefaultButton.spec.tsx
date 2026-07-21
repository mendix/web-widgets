import "@testing-library/jest-dom";
import { createRef, ReactElement, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { EditorContext } from "../../../EditorContext";
import { ToolbarDefaultButton } from "../ToolbarDefaultButton";

// ToolbarDefaultButton reads code view state via useCurrentEditor(), which throws
// without a provider — so every render is wrapped in an EditorContext.
function renderWithEditor(children: ReactNode, isCodeView = false): ReturnType<typeof render> {
    return render(
        <EditorContext.Provider
            value={{
                editor: null,
                codeViewState: { isCodeView, htmlCode: "", showConfirm: false },
                codeViewDispatch: () => undefined
            }}
        >
            {children as ReactElement}
        </EditorContext.Provider>
    );
}

function renderInCodeView(children: ReactNode): ReturnType<typeof render> {
    return renderWithEditor(children, true);
}

describe("ToolbarDefaultButton", () => {
    it("renders the default icon span from the icon prop", () => {
        const { container } = renderWithEditor(<ToolbarDefaultButton icon="Text-bold" title="Bold" />);

        expect(container.querySelector("span.icons.icon-Text-bold")).toBeInTheDocument();
    });

    it("renders children instead of the default icon when provided", () => {
        renderWithEditor(
            <ToolbarDefaultButton title="Font">
                <span className="dropdown-label">Arial</span>
            </ToolbarDefaultButton>
        );

        expect(screen.getByText("Arial")).toBeInTheDocument();
        expect(document.querySelector("span.icons")).not.toBeInTheDocument();
    });

    it("uses the icon-button base class by default and adds is-active when active", () => {
        renderWithEditor(<ToolbarDefaultButton icon="Undo" isActive title="Undo" />);
        const button = screen.getByRole("button");

        expect(button).toHaveClass("icon-button");
        expect(button).toHaveClass("is-active");
    });

    it("replaces the base class with a caller-supplied className", () => {
        renderWithEditor(<ToolbarDefaultButton className="split-button-main" title="List" />);
        const button = screen.getByRole("button");

        expect(button).toHaveClass("split-button-main");
        expect(button).not.toHaveClass("icon-button");
    });

    it("swaps to activeIcon when active", () => {
        const { container } = renderWithEditor(
            <ToolbarDefaultButton icon="Redo" activeIcon="Undo" isActive title="Redo" />
        );

        expect(container.querySelector("span.icon-Undo")).toBeInTheDocument();
        expect(container.querySelector("span.icon-Redo")).not.toBeInTheDocument();
    });

    it("renders a native disabled attribute", () => {
        renderWithEditor(<ToolbarDefaultButton icon="Undo" disabled title="Undo" />);

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("passes through aria attributes and defaults type to button", () => {
        renderWithEditor(
            <ToolbarDefaultButton icon="List-numbers" aria-pressed aria-haspopup="menu" title="Ordered list" />
        );
        const button = screen.getByRole("button");

        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveAttribute("aria-pressed", "true");
        expect(button).toHaveAttribute("aria-haspopup", "menu");
    });

    it("forwards the ref to the underlying button element", () => {
        const ref = createRef<HTMLButtonElement>();
        renderWithEditor(<ToolbarDefaultButton ref={ref} icon="Undo" title="Undo" />);

        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("disables the button when the editor is in code view", () => {
        renderInCodeView(<ToolbarDefaultButton icon="Text-bold" title="Bold" />);

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("stays enabled in code view when allowInCodeView is set", () => {
        renderInCodeView(<ToolbarDefaultButton icon="Code" title="Code view" allowInCodeView />);

        expect(screen.getByRole("button")).toBeEnabled();
    });

    it("keeps an explicit disabled prop even with allowInCodeView", () => {
        renderInCodeView(<ToolbarDefaultButton icon="Code" title="Code view" allowInCodeView disabled />);

        expect(screen.getByRole("button")).toBeDisabled();
    });
});
