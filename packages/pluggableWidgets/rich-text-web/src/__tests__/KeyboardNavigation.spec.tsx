import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Editor as CoreEditor } from "@tiptap/core";
import { Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ReactElement, ReactNode } from "react";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";
import { EditorContextProvider } from "../components/EditorContext";
import { ConfigurationDropdown, ConfigurationSection } from "../components/toolbars/components/ConfigurationDropdown";
import { ToolbarButton } from "../components/toolbars/components/ToolbarButton";
import { TOOLBAR_GROUPS, ToolbarButtonConfig } from "../components/toolbars/ToolbarConfig";
import RichText from "../RichText";
import { TranslationProvider } from "../utils/i18n";

function buildProps(overrides: Partial<RichTextContainerProps> = {}): RichTextContainerProps {
    return {
        name: "RichText",
        id: "RichText1",
        stringAttribute: new EditableValueBuilder<string>().withValue("<p>text</p>").build(),
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
        tableBetter: false,
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

type EditorDom = HTMLElement & { editor: CoreEditor };

function renderWidget(overrides: Partial<RichTextContainerProps> = {}): {
    container: HTMLElement;
    dom: EditorDom;
    editor: CoreEditor;
} {
    const { container } = render(<RichText {...buildProps(overrides)} />);
    const dom = container.querySelector(".ProseMirror") as EditorDom;
    return { container, dom, editor: dom.editor };
}

// Renders a toolbar component against a standalone editor, with the contexts it reads.
function renderWithEditor(editor: Editor, children: ReactNode): ReturnType<typeof render> {
    const Wrapper = (): ReactElement => (
        <TranslationProvider>
            <EditorContextProvider
                editor={editor}
                imageConfig={{ enableDefaultUpload: true, hasImageSource: false }}
                dialogStyle="inline"
            >
                {children}
            </EditorContextProvider>
        </TranslationProvider>
    );
    return render(<Wrapper />);
}

function createEditor(): Editor {
    const element = document.createElement("div");
    document.body.appendChild(element);
    return new Editor({ element, extensions: [StarterKit], content: "<p>text</p>" });
}

// Contract (KeyboardNavigation extension): Alt+F10 inside the editor moves focus to the first
// enabled toolbar button (or the wrapper when the toolbar is hidden); Alt+F11 moves focus to
// the status bar.
describe("KeyboardNavigation shortcuts", () => {
    it("Alt+F10 focuses the first enabled toolbar button", () => {
        const { container, dom } = renderWidget();
        const toolbar = container.querySelector(".tiptap-toolbar") as HTMLElement;
        const firstEnabled = toolbar.querySelector<HTMLButtonElement>("button:not([disabled])");
        expect(firstEnabled).not.toBeNull();

        fireEvent.keyDown(dom, { key: "F10", altKey: true });

        expect(document.activeElement).toBe(firstEnabled);
    });

    it("Alt+F10 focuses the wrapper when the toolbar is hidden", () => {
        const { container, dom } = renderWidget({ toolbarLocation: "hide" });
        expect(container.querySelector(".tiptap-toolbar")).toBeNull();
        const wrapper = container.querySelector(".tiptap-wrapper") as HTMLElement;

        fireEvent.keyDown(dom, { key: "F10", altKey: true });

        expect(wrapper).toHaveAttribute("tabindex", "0");
        expect(document.activeElement).toBe(wrapper);
    });

    it("Alt+F11 focuses the status bar", () => {
        const { container, dom } = renderWidget();
        const statusBar = container.querySelector(".rich-text-status-bar") as HTMLElement;
        expect(statusBar).not.toBeNull();

        fireEvent.keyDown(dom, { key: "F11", altKey: true });

        expect(document.activeElement).toBe(statusBar);
    });

    it("F10 without Alt does not move focus to the toolbar", () => {
        const { container, dom } = renderWidget();
        const toolbar = container.querySelector(".tiptap-toolbar") as HTMLElement;

        fireEvent.keyDown(dom, { key: "F10" });

        expect(toolbar.contains(document.activeElement)).toBe(false);
    });
});

// Contract (Fullscreen extension): Escape exits fullscreen only when it is active.
describe("Fullscreen Escape", () => {
    it("Escape removes the fullscreen class after toggleFullscreen", () => {
        const { container, dom, editor } = renderWidget();
        const widget = container.querySelector(".widget-rich-text") as HTMLElement;

        act(() => {
            editor.commands.toggleFullscreen();
        });
        expect(widget).toHaveClass("fullscreen");

        fireEvent.keyDown(dom, { key: "Escape" });

        expect(widget).not.toHaveClass("fullscreen");
    });

    it("Escape is a no-op when not in fullscreen", () => {
        const { container, dom } = renderWidget();
        const widget = container.querySelector(".widget-rich-text") as HTMLElement;

        fireEvent.keyDown(dom, { key: "Escape" });

        expect(widget).not.toHaveClass("fullscreen");
    });
});

// Contract (Fullscreen extension + toolbar): with several widgets on a page, fullscreen and its
// toolbar active state belong to the editor instance that triggered them.
describe("Fullscreen with multiple widgets", () => {
    function renderTwoWidgets(): {
        widgets: HTMLElement[];
        doms: EditorDom[];
    } {
        const { container } = render(
            <div>
                <RichText {...buildProps({ id: "RichText1", name: "RichText1" })} />
                <RichText {...buildProps({ id: "RichText2", name: "RichText2" })} />
            </div>
        );
        const widgets = Array.from(container.querySelectorAll<HTMLElement>(".widget-rich-text"));
        const doms = Array.from(container.querySelectorAll<EditorDom>(".ProseMirror"));
        expect(widgets).toHaveLength(2);
        expect(doms).toHaveLength(2);
        return { widgets, doms };
    }

    function fullscreenIsActive(editor: CoreEditor): boolean {
        const config = TOOLBAR_GROUPS.flatMap(group => group.buttons).find(button => button.name === "fullscreen");
        return config?.isActive?.(editor as Editor) ?? false;
    }

    it("toggleFullscreen on the second editor only affects the second widget", () => {
        const { widgets, doms } = renderTwoWidgets();

        act(() => {
            doms[1].editor.commands.toggleFullscreen();
        });

        expect(widgets[0]).not.toHaveClass("fullscreen");
        expect(widgets[1]).toHaveClass("fullscreen");
    });

    it("Escape in the second editor exits fullscreen only for the second widget", () => {
        const { widgets, doms } = renderTwoWidgets();

        act(() => {
            doms[0].editor.commands.toggleFullscreen();
            doms[1].editor.commands.toggleFullscreen();
        });
        expect(widgets[0]).toHaveClass("fullscreen");
        expect(widgets[1]).toHaveClass("fullscreen");

        fireEvent.keyDown(doms[1], { key: "Escape" });

        expect(widgets[0]).toHaveClass("fullscreen");
        expect(widgets[1]).not.toHaveClass("fullscreen");
    });

    it("clicking the second widget's fullscreen button marks only that button active", () => {
        const { widgets, doms } = renderTwoWidgets();
        const buttons = widgets.map(widget => within(widget).getByTitle("Fullscreen"));

        fireEvent.click(buttons[1]);

        expect(widgets[0]).not.toHaveClass("fullscreen");
        expect(widgets[1]).toHaveClass("fullscreen");
        expect(buttons[1]).toHaveClass("is-active");
        expect(fullscreenIsActive(doms[0].editor)).toBe(false);
        expect(fullscreenIsActive(doms[1].editor)).toBe(true);
    });
});

// Contract (ToolbarButton): Tab (without Shift) on the last enabled toolbar button returns
// focus to the editor instead of leaving the widget; other buttons keep native Tab behaviour.
describe("ToolbarButton Tab handling", () => {
    const bold: ToolbarButtonConfig = {
        name: "bold",
        title: "toolbar.bold",
        icon: "Bold",
        action: "toggle",
        command: "toggleBold"
    };
    const italic: ToolbarButtonConfig = {
        name: "italic",
        title: "toolbar.italic",
        icon: "Italic",
        action: "toggle",
        command: "toggleItalic"
    };

    let editor: Editor;
    let focusSpy: jest.SpyInstance;

    beforeEach(() => {
        editor = createEditor();
        focusSpy = jest.spyOn(editor.view, "focus");
        renderWithEditor(
            editor,
            <div className="tiptap-toolbar">
                <ToolbarButton config={bold} />
                <ToolbarButton config={italic} />
            </div>
        );
    });

    afterEach(() => {
        editor.destroy();
        document.body.innerHTML = "";
    });

    it("Tab on the last button focuses the editor and prevents default", () => {
        const last = screen.getByTitle("Italic");

        const notPrevented = fireEvent.keyDown(last, { key: "Tab" });

        expect(notPrevented).toBe(false);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it("Tab on a non-last button keeps native behaviour", () => {
        const notPrevented = fireEvent.keyDown(screen.getByTitle("Bold"), { key: "Tab" });

        expect(notPrevented).toBe(true);
        expect(focusSpy).not.toHaveBeenCalled();
    });

    it("Shift+Tab on the last button keeps native behaviour", () => {
        const notPrevented = fireEvent.keyDown(screen.getByTitle("Italic"), { key: "Tab", shiftKey: true });

        expect(notPrevented).toBe(true);
        expect(focusSpy).not.toHaveBeenCalled();
    });
});

// Contract (ToolbarSplitButton): ArrowRight moves from main to dropdown part, ArrowLeft moves
// back, ArrowDown opens the style menu.
describe("ToolbarSplitButton arrow keys", () => {
    function getParts(container: HTMLElement): { main: HTMLButtonElement; dropdown: HTMLButtonElement } {
        return {
            main: container.querySelector(".split-button-main") as HTMLButtonElement,
            dropdown: container.querySelector(".split-button-dropdown") as HTMLButtonElement
        };
    }

    it("ArrowRight on the main part focuses the dropdown part", () => {
        const { container } = renderWidget();
        const { main, dropdown } = getParts(container);
        main.focus();

        fireEvent.keyDown(main, { key: "ArrowRight" });

        expect(document.activeElement).toBe(dropdown);
    });

    it("ArrowLeft on the dropdown part focuses the main part", () => {
        const { container } = renderWidget();
        const { main, dropdown } = getParts(container);
        dropdown.focus();

        fireEvent.keyDown(dropdown, { key: "ArrowLeft" });

        expect(document.activeElement).toBe(main);
    });

    it("ArrowLeft on the main part does not move focus", () => {
        const { container } = renderWidget();
        const { main } = getParts(container);
        main.focus();

        fireEvent.keyDown(main, { key: "ArrowLeft" });

        expect(document.activeElement).toBe(main);
    });

    it("ArrowDown opens the style menu", () => {
        const { container } = renderWidget();
        const { main, dropdown } = getParts(container);
        expect(dropdown).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(main, { key: "ArrowDown" });

        expect(dropdown).toHaveAttribute("aria-expanded", "true");
        expect(container.querySelector(".split-button [role='menu']")).toBeInTheDocument();
    });
});

// Contract (ConfigurationDropdown buffered inputs): Enter commits the draft value and blurs;
// Escape discards the draft (no commit) and blurs.
describe("ConfigurationDropdown Enter/Escape", () => {
    let editor: Editor;
    let onChange: jest.Mock;

    beforeEach(() => {
        editor = createEditor();
        onChange = jest.fn();
        const section: ConfigurationSection = {
            id: "width",
            label: "Width",
            type: "textInput",
            getCurrentValue: () => "10",
            onChange
        };
        const config: ToolbarButtonConfig = {
            name: "tableConfiguration",
            title: "toolbar.tableConfiguration",
            icon: "Table-configuration",
            action: "configurationDropdown",
            configurationSections: [section]
        };
        renderWithEditor(editor, <ConfigurationDropdown config={config} />);
        fireEvent.click(screen.getByRole("button"));
    });

    afterEach(() => {
        editor.destroy();
        document.body.innerHTML = "";
    });

    it("Enter commits the draft value and blurs the input", () => {
        const input = document.querySelector(".configuration-input") as HTMLInputElement;
        input.focus();
        fireEvent.change(input, { target: { value: "42" } });

        fireEvent.keyDown(input, { key: "Enter" });

        expect(onChange).toHaveBeenCalledWith("42");
        expect(document.activeElement).not.toBe(input);
    });

    it("typing alone does not commit to the editor", () => {
        const input = document.querySelector(".configuration-input") as HTMLInputElement;
        fireEvent.change(input, { target: { value: "42" } });

        expect(onChange).not.toHaveBeenCalled();
        expect(input.value).toBe("42");
    });

    it("Escape blurs the input", () => {
        const input = document.querySelector(".configuration-input") as HTMLInputElement;
        input.focus();
        fireEvent.change(input, { target: { value: "42" } });

        fireEvent.keyDown(input, { key: "Escape" });

        expect(document.activeElement).not.toBe(input);
    });
});
