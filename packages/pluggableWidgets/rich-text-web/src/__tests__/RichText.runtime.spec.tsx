import "@testing-library/jest-dom";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { Editor } from "@tiptap/core";
import { actionValue, EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { RichTextContainerProps, StatusBarContentEnum } from "../../typings/RichTextProps";
import RichText from "../RichText";

const richTextDefaultValue = `<h2><strong>Rich text default value</strong></h2>`;

function getEditorDom(container: HTMLElement): HTMLElement & { editor: Editor } {
    return container.querySelector(".ProseMirror") as HTMLElement & { editor: Editor };
}

function getEditor(container: HTMLElement): Editor {
    return getEditorDom(container).editor;
}

function flush(): void {
    act(() => {
        jest.advanceTimersByTime(500);
    });
}

function edit(container: HTMLElement, html: string): void {
    act(() => {
        getEditor(container).commands.setContent(html);
    });
    flush();
}

describe("Rich Text runtime behaviour", () => {
    let defaultProps: RichTextContainerProps;

    beforeEach(() => {
        jest.useFakeTimers();
        defaultProps = {
            name: "RichText",
            id: "RichText1",
            stringAttribute: new EditableValueBuilder<string>().withValue(richTextDefaultValue).build(),
            preset: "basic",
            toolbarLocation: "bottom",
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
            styleDataFormat: "inline"
        };
    });

    afterEach(() => jest.useRealTimers());

    describe("actions", () => {
        // On load / On enter / On leave / On change are the widget's only hooks into app
        // logic. Each must fire exactly on its trigger, respect canExecute, and follow the
        // ActionValue objects the runtime passes on each render.
        it("executes onLoad once on mount", () => {
            const onLoad = actionValue();
            render(<RichText {...defaultProps} onLoad={onLoad} />);
            flush();

            expect(onLoad.execute).toHaveBeenCalledTimes(1);
        });

        it("executes onFocus when the editor gains focus", () => {
            const onFocus = actionValue();
            const { container } = render(<RichText {...defaultProps} onFocus={onFocus} />);

            fireEvent.focus(getEditorDom(container));

            expect(onFocus.execute).toHaveBeenCalledTimes(1);
        });

        it("executes onBlur when the editor loses focus", () => {
            const onBlur = actionValue();
            const { container } = render(<RichText {...defaultProps} onBlur={onBlur} />);

            fireEvent.focus(getEditorDom(container));
            fireEvent.blur(getEditorDom(container));

            expect(onBlur.execute).toHaveBeenCalledTimes(1);
        });

        it("executes onChange on blur and not on edit when onChangeType is onLeave", () => {
            const onChange = actionValue();
            const { container } = render(<RichText {...defaultProps} onChangeType="onLeave" onChange={onChange} />);

            edit(container, "<p>edited</p>");
            expect(onChange.execute).not.toHaveBeenCalled();

            fireEvent.focus(getEditorDom(container));
            fireEvent.blur(getEditorDom(container));
            expect(onChange.execute).toHaveBeenCalledTimes(1);
        });

        it("executes onChange on edit and not on blur when onChangeType is onDataChange", () => {
            const onChange = actionValue();
            const { container } = render(
                <RichText {...defaultProps} onChangeType="onDataChange" onChange={onChange} />
            );

            edit(container, "<p>edited</p>");
            expect(onChange.execute).toHaveBeenCalledTimes(1);

            fireEvent.focus(getEditorDom(container));
            fireEvent.blur(getEditorDom(container));
            expect(onChange.execute).toHaveBeenCalledTimes(1);
        });

        it("executes no action when canExecute is false", () => {
            const onLoad = actionValue(false);
            const onFocus = actionValue(false);
            const onBlur = actionValue(false);
            const onLeaveChange = actionValue(false);
            const onDataChange = actionValue(false);

            const leave = render(
                <RichText
                    {...defaultProps}
                    onChangeType="onLeave"
                    onLoad={onLoad}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={onLeaveChange}
                />
            );
            edit(leave.container, "<p>edited</p>");
            fireEvent.focus(getEditorDom(leave.container));
            fireEvent.blur(getEditorDom(leave.container));
            leave.unmount();

            const data = render(<RichText {...defaultProps} onChangeType="onDataChange" onChange={onDataChange} />);
            edit(data.container, "<p>edited again</p>");

            expect(onLoad.execute).not.toHaveBeenCalled();
            expect(onFocus.execute).not.toHaveBeenCalled();
            expect(onBlur.execute).not.toHaveBeenCalled();
            expect(onLeaveChange.execute).not.toHaveBeenCalled();
            expect(onDataChange.execute).not.toHaveBeenCalled();
        });

        it("executes the ActionValues from the latest render", () => {
            const first = { onFocus: actionValue(), onBlur: actionValue(), onChange: actionValue() };
            const second = { onFocus: actionValue(), onBlur: actionValue(), onChange: actionValue() };
            const { container, rerender } = render(<RichText {...defaultProps} onChangeType="onLeave" {...first} />);

            rerender(<RichText {...defaultProps} onChangeType="onLeave" {...second} />);
            fireEvent.focus(getEditorDom(container));
            fireEvent.blur(getEditorDom(container));

            expect(second.onFocus.execute).toHaveBeenCalledTimes(1);
            expect(second.onBlur.execute).toHaveBeenCalledTimes(1);
            expect(second.onChange.execute).toHaveBeenCalledTimes(1);
            expect(first.onFocus.execute).not.toHaveBeenCalled();
            expect(first.onBlur.execute).not.toHaveBeenCalled();
            expect(first.onChange.execute).not.toHaveBeenCalled();
        });
    });

    describe("writing to the attribute", () => {
        // User edits are the only path into the bound attribute. The written value must be the
        // editor's HTML, an empty editor must store "" (not an empty paragraph), unchanged
        // content must not dirty the attribute, and writes must target the current attribute.
        it("writes the editor HTML on edit", () => {
            const stringAttribute = defaultProps.stringAttribute;
            const { container } = render(<RichText {...defaultProps} />);

            edit(container, "<p>edited</p>");

            expect(stringAttribute.setValue).toHaveBeenCalledTimes(1);
            expect(stringAttribute.setValue).toHaveBeenCalledWith(getEditor(container).getHTML());
            expect(stringAttribute.setValue).toHaveBeenCalledWith(expect.stringContaining("edited"));
        });

        it("writes an empty string when the editor is cleared", () => {
            const stringAttribute = defaultProps.stringAttribute;
            const { container } = render(<RichText {...defaultProps} />);

            act(() => {
                getEditor(container).commands.clearContent(true);
            });
            flush();

            expect(stringAttribute.setValue).toHaveBeenCalledTimes(1);
            expect(stringAttribute.setValue).toHaveBeenCalledWith("");
        });

        it("does not write when an edit produces the current value", () => {
            const stringAttribute = defaultProps.stringAttribute;
            const { container } = render(<RichText {...defaultProps} />);

            edit(container, "<p>edited</p>");
            expect(stringAttribute.setValue).toHaveBeenCalledTimes(1);

            edit(container, "<p>edited</p>");
            expect(stringAttribute.setValue).toHaveBeenCalledTimes(1);
        });

        it("writes to the attribute from the latest render", () => {
            const oldAttribute = defaultProps.stringAttribute;
            const { container, rerender } = render(<RichText {...defaultProps} />);

            edit(container, "<p>first</p>");
            expect(oldAttribute.setValue).toHaveBeenCalledTimes(1);

            const newAttribute = new EditableValueBuilder<string>().withValue(oldAttribute.value).build();
            rerender(<RichText {...defaultProps} stringAttribute={newAttribute} />);
            edit(container, "<p>second</p>");

            expect(newAttribute.setValue).toHaveBeenCalledTimes(1);
            expect(newAttribute.setValue).toHaveBeenCalledWith(expect.stringContaining("second"));
            expect(oldAttribute.setValue).toHaveBeenCalledTimes(1);
        });
    });

    describe("attribute status", () => {
        // The editor must only mount for an available attribute; loading shows a progress
        // indicator, and validation feedback is shown regardless.
        it("renders the loading indicator and no editor while loading", () => {
            const { container } = render(
                <RichText {...defaultProps} stringAttribute={new EditableValueBuilder<string>().isLoading().build()} />
            );

            expect(container.querySelector(".mx-progress")).toBeInTheDocument();
            expect(container.querySelector(".ProseMirror")).not.toBeInTheDocument();
        });

        it("renders no editor when unavailable", () => {
            const { container } = render(
                <RichText
                    {...defaultProps}
                    stringAttribute={new EditableValueBuilder<string>().isUnavailable().build()}
                />
            );

            expect(container.querySelector(".ProseMirror")).not.toBeInTheDocument();
        });

        it("renders the validation message", () => {
            render(
                <RichText
                    {...defaultProps}
                    stringAttribute={new EditableValueBuilder<string>()
                        .withValue(richTextDefaultValue)
                        .withValidation("Required")
                        .build()}
                />
            );

            expect(screen.getByText("Required")).toBeInTheDocument();
        });
    });

    describe("read-only styles", () => {
        // Each read-only style maps to a root class; only "text" keeps the toolbar, and the
        // editor content must not be editable.
        function renderReadOnly(readOnlyStyle: RichTextContainerProps["readOnlyStyle"]): RenderResult {
            return render(
                <RichText
                    {...defaultProps}
                    readOnlyStyle={readOnlyStyle}
                    stringAttribute={new EditableValueBuilder<string>()
                        .withValue(richTextDefaultValue)
                        .isReadOnly()
                        .build()}
                />
            );
        }

        it.each([
            ["bordered", "form-control", false],
            ["text", "form-control", true],
            ["readPanel", "form-control-static", false]
        ] as const)("applies the %s style", (readOnlyStyle, controlClass, hasToolbar) => {
            const { container } = renderReadOnly(readOnlyStyle);
            const root = container.querySelector(".widget-rich-text") as HTMLElement;

            expect(root).toHaveClass(controlClass, `widget-rich-text-readonly-${readOnlyStyle}`);
            expect(container.querySelector(".tiptap-toolbar") !== null).toBe(hasToolbar);
            expect(getEditorDom(container)).toHaveAttribute("contenteditable", "false");
        });

        // Editability can change after the editor mounted (e.g. conditional editability in
        // Studio Pro); the editor must follow without writing back to the attribute.
        it("becomes read-only when the attribute turns read-only after mount", () => {
            const editable = new EditableValueBuilder<string>().withValue(richTextDefaultValue).build();
            const { container, rerender } = render(<RichText {...defaultProps} stringAttribute={editable} />);
            expect(getEditorDom(container)).toHaveAttribute("contenteditable", "true");

            const readOnly = new EditableValueBuilder<string>().withValue(richTextDefaultValue).isReadOnly().build();
            rerender(<RichText {...defaultProps} stringAttribute={readOnly} />);
            flush();

            expect(getEditorDom(container)).toHaveAttribute("contenteditable", "false");
            expect(editable.setValue).not.toHaveBeenCalled();
            expect(readOnly.setValue).not.toHaveBeenCalled();
        });

        it("becomes editable when the attribute turns editable after mount", () => {
            const readOnly = new EditableValueBuilder<string>().withValue(richTextDefaultValue).isReadOnly().build();
            const { container, rerender } = render(<RichText {...defaultProps} stringAttribute={readOnly} />);
            expect(getEditorDom(container)).toHaveAttribute("contenteditable", "false");

            const editable = new EditableValueBuilder<string>().withValue(richTextDefaultValue).build();
            rerender(<RichText {...defaultProps} stringAttribute={editable} />);
            flush();

            expect(getEditorDom(container)).toHaveAttribute("contenteditable", "true");
            expect(readOnly.setValue).not.toHaveBeenCalled();
            expect(editable.setValue).not.toHaveBeenCalled();
        });
    });

    describe("toolbar location", () => {
        // The root class drives the toolbar placement in SCSS; "hide" must not render it at all.
        it.each([
            ["auto", true],
            ["top", true],
            ["bottom", true],
            ["hide", false]
        ] as const)("renders toolbar location %s", (toolbarLocation, hasToolbar) => {
            const { container } = render(
                <RichText {...defaultProps} preset="basic" toolbarLocation={toolbarLocation} />
            );

            expect(container.querySelector(".widget-rich-text")).toHaveClass(`toolbar-${toolbarLocation}`);
            expect(container.querySelector(".tiptap-toolbar") !== null).toBe(hasToolbar);
        });
    });
});
