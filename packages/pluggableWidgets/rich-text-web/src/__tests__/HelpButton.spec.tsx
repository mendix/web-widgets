import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";
import RichText from "../RichText";

const richTextDefaultValue = `<p>Hello</p>`;

function buildProps(overrides: Partial<RichTextContainerProps> = {}): RichTextContainerProps {
    return {
        name: "RichText",
        id: "RichText1",
        stringAttribute: new EditableValueBuilder<string>().withValue(richTextDefaultValue).build(),
        preset: "full",
        toolbarLocation: "top",
        widthUnit: "percentage",
        width: 100,
        heightUnit: "percentageOfWidth",
        height: 75,
        toolbarConfig: "basic",
        history: true,
        fontStyle: true,
        fontScript: true,
        fontColor: true,
        code: true,
        indent: true,
        embed: true,
        align: true,
        list: true,
        remove: true,
        header: true,
        view: true,
        tableBetter: true,
        helpButton: true,
        advancedConfig: [],
        readOnlyStyle: "text",
        tabIndex: 0,
        onChangeType: "onLeave",
        enableStatusBar: true,
        dialogStyle: "inline",
        statusBarContent: "wordCount" as StatusBarContentEnum,
        spellCheck: true,
        minHeightUnit: "none",
        maxHeightUnit: "none",
        maxHeight: 0,
        minHeight: 75,
        OverflowY: "auto",
        customFonts: [],
        enableDefaultUpload: true,
        linkValidation: true,
        styleDataFormat: "inline",
        ...overrides
    };
}

function getHelpButton(): HTMLElement | null {
    return screen.queryByRole("button", { name: "Keyboard shortcuts" });
}

describe("Rich Text help button", () => {
    describe("visibility gating", () => {
        it("renders under full preset", () => {
            render(<RichText {...buildProps({ preset: "full" })} />);
            expect(getHelpButton()).toBeInTheDocument();
        });

        it("does not render under basic preset", () => {
            render(<RichText {...buildProps({ preset: "basic" })} />);
            expect(getHelpButton()).not.toBeInTheDocument();
        });

        it("does not render under standard preset", () => {
            render(<RichText {...buildProps({ preset: "standard" })} />);
            expect(getHelpButton()).not.toBeInTheDocument();
        });

        it("renders under custom preset with all groups enabled", () => {
            render(<RichText {...buildProps({ preset: "custom", toolbarConfig: "basic" })} />);
            expect(getHelpButton()).toBeInTheDocument();
        });

        it("does not render under custom preset when a group is disabled", () => {
            render(<RichText {...buildProps({ preset: "custom", toolbarConfig: "basic", tableBetter: false })} />);
            expect(getHelpButton()).not.toBeInTheDocument();
        });

        it("does not render when helpButton is false, even under full preset", () => {
            render(<RichText {...buildProps({ preset: "full", helpButton: false })} />);
            expect(getHelpButton()).not.toBeInTheDocument();
        });
    });

    describe("modal behavior", () => {
        it("opens the shortcuts modal on click", () => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
            expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
        });

        it("closes on Escape", () => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            fireEvent.keyDown(dialog, { key: "Escape" });
            expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument();
        });

        it("closes on click outside", () => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
            expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
            fireEvent.mouseDown(document.body);
            expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument();
        });

        it("closes on Close button", () => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
            expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).not.toBeInTheDocument();
        });
    });

    describe("accessibility", () => {
        it("exposes dialog semantics and an accessible name", () => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            expect(dialog).toHaveAttribute("aria-modal", "true");
        });

        // The focus trap moves focus in a microtask, so this has to wait rather than assert inline.
        it("moves focus into the dialog on open", async () => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            await waitFor(() => expect(dialog).toHaveFocus());
        });
    });

    describe("shortcut catalog", () => {
        beforeEach(() => {
            render(<RichText {...buildProps()} />);
            fireEvent.click(getHelpButton()!);
        });

        it("lists formatting shortcuts", () => {
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            expect(within(dialog).getByText("Bold")).toBeInTheDocument();
            expect(within(dialog).getByText("Italic")).toBeInTheDocument();
            expect(within(dialog).getByText("Underline")).toBeInTheDocument();
            expect(within(dialog).getByText("Strikethrough")).toBeInTheDocument();
        });

        it("lists paragraph indent shortcuts", () => {
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            expect(within(dialog).getByText("Increase indent")).toBeInTheDocument();
            expect(within(dialog).getByText("Decrease indent")).toBeInTheDocument();
        });

        it("lists history shortcuts", () => {
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            expect(within(dialog).getByText("Undo")).toBeInTheDocument();
            expect(within(dialog).getByText("Redo")).toBeInTheDocument();
        });

        it("lists accessibility navigation shortcuts", () => {
            const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
            expect(within(dialog).getByText("Focus toolbar")).toBeInTheDocument();
            expect(within(dialog).getByText("Focus status bar")).toBeInTheDocument();
            expect(within(dialog).getByText("Alt+F10")).toBeInTheDocument();
            expect(within(dialog).getByText("Alt+F11")).toBeInTheDocument();
        });
    });
});
